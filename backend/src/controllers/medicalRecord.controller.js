import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import cloudinary from '../config/cloudinary.js';
import Notification from '../models/Notification.js';
import { io, getReceiverSocketId } from '../services/socket.js';

/**
 * Get all medical records (filtered by role)
 */
export const getAllMedicalRecords = async (req, res) => {
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

        const records = await MedicalRecord.find(query)
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
            .sort({ visitDate: -1 });

        const count = await MedicalRecord.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                records,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medical records',
        });
    }
};

/**
 * Get medical record by ID
 */
export const getMedicalRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('appointment');

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        console.error('Get medical record error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medical record',
        });
    }
};

/**
 * Get patient's medical records
 */
export const getPatientMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.params.patientId })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('appointment')
            .sort({ visitDate: -1 });

        res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error('Get patient medical records error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient medical records',
        });
    }
};

/**
 * Create medical record (Doctor only)
 */
export const createMedicalRecord = async (req, res) => {
    try {
        // Get doctor ID from authenticated user
        const doctor = await Doctor.findOne({ user: req.user.id });

        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can create medical records',
            });
        }

        const recordData = {
            ...req.body,
            doctor: doctor._id,
        };

        const record = await MedicalRecord.create(recordData);

        const populatedRecord = await MedicalRecord.findById(record._id)
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
            recipient: populatedRecord.patient.user._id,
            sender: req.user.id,
            type: 'medical_record_created',
            message: `Dr. ${req.user.firstName} ${req.user.lastName} added a new medical record for you.`,
            relatedId: populatedRecord._id,
            link: '/patient/records',
        });

        // Emit Socket Event to Patient
        if (populatedRecord.patient?.user?._id) {
            const receiverSocketId = getReceiverSocketId(populatedRecord.patient.user._id.toString());
            if (receiverSocketId) {
                // Emit both record update and new notification
                io.to(receiverSocketId).emit('medical_record_updated', populatedRecord);
                io.to(receiverSocketId).emit('newNotification', notification);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Medical record created successfully',
            data: populatedRecord,
        });
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating medical record',
            error: error.message,
        });
    }
};

/**
 * Update medical record (Doctor only)
 */
export const updateMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByIdAndUpdate(
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

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medical record updated successfully',
            data: record,
        });
    } catch (error) {
        console.error('Update medical record error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating medical record',
        });
    }
};

/**
 * Upload attachment to medical record
 */
export const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'medical-records',
            resource_type: 'auto',
        });

        const attachment = {
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            fileType: req.file.mimetype,
        };

        // Add attachment to medical record
        const record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            { $push: { attachments: attachment } },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: attachment,
        });
    } catch (error) {
        console.error('Upload attachment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading attachment',
        });
    }
};

/**
 * Get all attachments for patient's medical records
 */
export const getPatientAttachments = async (req, res) => {
    try {
        const { id } = req.user;
        
        // Get patient record
        const patient = await Patient.findOne({ user: id });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Get all medical records for this patient with attachments
        const records = await MedicalRecord.find({ patient: patient._id })
            .select('attachments visitDate diagnosis doctor')
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .sort({ visitDate: -1 });

        // Extract all attachments with metadata
        const attachments = [];
        records.forEach(record => {
            if (record.attachments && record.attachments.length > 0) {
                record.attachments.forEach(attachment => {
                    attachments.push({
                        ...attachment.toObject(),
                        _id: attachment._id || `${record._id}-${attachment.fileName}`,
                        recordId: record._id,
                        visitDate: record.visitDate,
                        diagnosis: record.diagnosis,
                        doctor: record.doctor?.user ? `Dr. ${record.doctor.user.firstName} ${record.doctor.user.lastName}` : 'Unknown Doctor',
                        uploadedBy: 'doctor',
                    });
                });
            }
        });

        res.status(200).json({
            success: true,
            data: attachments,
        });
    } catch (error) {
        console.error('Get patient attachments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attachments',
        });
    }
};

