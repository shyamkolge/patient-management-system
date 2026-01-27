import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

/**
 * Get all doctors
 */
export const getAllDoctors = async (req, res) => {
    try {
        const { specialization, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        let doctors = await Doctor.find(query)
            .populate('user', 'firstName lastName email phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Filter by name if search provided
        if (search) {
            doctors = doctors.filter(doc => {
                const fullName = `${doc.user.firstName} ${doc.user.lastName}`.toLowerCase();
                return fullName.includes(search.toLowerCase());
            });
        }

        const count = await Doctor.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                doctors,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
        });
    }
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('user', 'firstName lastName email phone status');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor',
        });
    }
};

/**
 * Create doctor (Admin)
 */
export const createDoctor = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, ...doctorData } = req.body;

        // Create user account
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: 'doctor',
        });

        // Create doctor profile
        const doctor = await Doctor.create({
            user: user._id,
            ...doctorData,
        });

        const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'firstName lastName email phone');

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: populatedDoctor,
        });
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating doctor',
            error: error.message,
        });
    }
};

/**
 * Update doctor
 */
export const updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctor',
        });
    }
};

/**
 * Get doctor's appointments
 */
export const getDoctorAppointments = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = { doctor: req.params.id };

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
            .populate('patient')
            .populate('doctor')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
        });
    }
};
