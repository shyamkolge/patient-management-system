import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

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
