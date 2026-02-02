import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { io, getReceiverSocketId } from '../services/socket.js';
import { sendAppointmentConfirmedNotification } from '../utils/pingram.js';

const parseDurationInDays = (duration) => {
    if (!duration) return null;
    const text = String(duration).toLowerCase();
    const match = text.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
    if (match) {
        const value = Number(match[1]);
        const unit = match[2];
        const multiplier = unit.startsWith('week') ? 7 : unit.startsWith('month') ? 30 : 1;
        return value * multiplier;
    }
    const numberOnly = text.match(/(\d+)/);
    return numberOnly ? Number(numberOnly[1]) : null;
};

const autoCompletePrescription = async (prescription) => {
    if (!prescription || prescription.status !== 'active') return prescription;

    const now = Date.now();
    let validUntil = prescription.validUntil ? new Date(prescription.validUntil) : null;

    if (!validUntil) {
        const duration = prescription.medications?.[0]?.duration;
        const days = parseDurationInDays(duration);
        if (days && prescription.issueDate) {
            validUntil = new Date(prescription.issueDate);
            validUntil.setDate(validUntil.getDate() + days);
        }
    }

    if (validUntil && validUntil.getTime() <= now) {
        prescription.status = 'completed';
        await prescription.save();
    }

    return prescription;
};

/**
 * Get all prescriptions (filtered by role)
 */
export const getAllPrescriptions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { role, id } = req.user;

        let query = {};

        // Filter by role
        if (role === 'doctor') {
            const doctor = await Doctor.findOne({ user: id });
            query.doctor = doctor._id;
        } else if (role === 'patient') {
            const patient = await Patient.findOne({ user: id });
            query.patient = patient._id;
        }

        const prescriptions = await Prescription.find(query)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ issueDate: -1 });

        await Promise.all(prescriptions.map(autoCompletePrescription));

        const count = await Prescription.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                prescriptions,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching prescriptions',
        });
    }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('medicalRecord');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found',
            });
        }

        await autoCompletePrescription(prescription);

        res.status(200).json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching prescription',
        });
    }
};

/**
 * Get patient's prescriptions
 */
export const getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.params.patientId })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .sort({ issueDate: -1 });

        await Promise.all(prescriptions.map(autoCompletePrescription));

        res.status(200).json({
            success: true,
            data: prescriptions,
        });
    } catch (error) {
        console.error('Get patient prescriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient prescriptions',
        });
    }
};

/**
 * Create prescription (Doctor only)
 */
export const createPrescription = async (req, res) => {
    try {
        // Get doctor ID from authenticated user
        const doctor = await Doctor.findOne({ user: req.user.id });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can create prescriptions',
            });
        }

        const prescriptionData = {
            ...req.body,
            doctor: doctor._id,
        };

        const prescription = await Prescription.create(prescriptionData);

        const populatedPrescription = await Prescription.findById(prescription._id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            });

        // Create Notification
        const notification = await Notification.create({
            recipient: populatedPrescription.patient.user._id,
            sender: req.user.id,
            type: 'prescription_created',
            message: `Dr. ${req.user.firstName} ${req.user.lastName} prescribed a new medication for you.`,
            relatedId: populatedPrescription._id,
            link: '/patient/prescriptions',
        });

        // Emit Socket Event to Patient
        if (populatedPrescription.patient?.user?._id) {
            const receiverSocketId = getReceiverSocketId(populatedPrescription.patient.user._id.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('prescription_created', populatedPrescription);
                io.to(receiverSocketId).emit('newNotification', notification);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: populatedPrescription,
        });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating prescription',
            error: error.message,
        });
    }
};

/**
 * Update prescription (Doctor only)
 */
export const updatePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            });

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Prescription updated successfully',
            data: prescription,
        });
    } catch (error) {
        console.error('Update prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating prescription',
        });
    }
};

/**
 * Send consultation completion notification (SMS and Email with prescription details)
 */
export const sendConsultationNotification = async (req, res) => {
    try {
        const { patientId, prescriptionId, consultationSummary } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID is required',
            });
        }

        // Get patient details
        const patient = await Patient.findById(patientId).populate('user', 'firstName lastName email phone');
        if (!patient || !patient.user) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Get prescription details if available
        let prescriptionDetails = '';
        if (prescriptionId) {
            const prescription = await Prescription.findById(prescriptionId)
                .populate('doctor', 'specialization')
                .populate('patient', 'dateOfBirth');

            if (prescription) {
                prescriptionDetails = `
Medications:
${prescription.medications.map((med, idx) => `${idx + 1}. ${med.name} - ${med.dosage} (${med.frequency})`).join('\n')}

${prescription.instructions ? `Instructions: ${prescription.instructions}` : ''}
${prescription.duration ? `Duration: ${prescription.duration}` : ''}
                `.trim();
            }
        }

        // Prepare SMS message
        const smsMessage = `Hello ${patient.user.firstName}, your consultation is complete. ${prescriptionDetails ? 'Prescription details sent via email.' : 'Thank you for visiting.'}`;

        // Prepare Email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
        .medication { background-color: #f0f9ff; padding: 10px; margin: 10px 0; border-left: 4px solid #3b82f6; }
        .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Consultation Complete</h1>
        </div>
        <div class="content">
            <p>Dear ${patient.user.firstName} ${patient.user.lastName},</p>
            <p>Thank you for your consultation. Here are your details:</p>
            
            ${consultationSummary ? `
            <div class="section">
                <div class="section-title">Consultation Summary</div>
                <pre style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">${consultationSummary}</pre>
            </div>
            ` : ''}
            
            ${prescriptionDetails ? `
            <div class="section">
                <div class="section-title">Prescription Details</div>
                <div style="white-space: pre-line;">${prescriptionDetails}</div>
            </div>
            ` : ''}
            
            <div class="section">
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Follow the prescribed treatment plan</li>
                    <li>Take medications as instructed</li>
                    <li>Attend follow-up appointments as scheduled</li>
                    <li>Contact us for any concerns</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from Patient Records Management System</p>
            <p>© 2026 Medical Clinic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send notification via NotificationAPI
        await sendAppointmentConfirmedNotification({
            toNumber: patient.user.phone || '+1234567890', // Use patient's phone if available
            toEmail: patient.user.email,
            toId: patient.user.email,
            smsMessage: smsMessage,
            emailSubject: 'Consultation Complete - Prescription Details',
            emailHtml: emailHtml
        });

        res.status(200).json({
            success: true,
            message: 'Consultation notification sent successfully to patient',
        });

    } catch (error) {
        console.error('Send consultation notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending consultation notification',
            error: error.message
        });
    }
};
