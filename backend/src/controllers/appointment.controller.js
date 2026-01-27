import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

/**
 * Get all appointments (filtered by role)
 */
export const getAllAppointments = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
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

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        const count = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
        });
    }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
        });
    }
};

/**
 * Create appointment
 */
export const createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create(req.body);

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: populatedAppointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message,
        });
    }
};

/**
 * Update appointment
 */
export const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment,
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
        });
    }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body;

        const updateData = { status };
        if (status === 'cancelled' && cancelReason) {
            updateData.cancelReason = cancelReason;
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            data: appointment,
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
        });
    }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully',
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
        });
    }
};
