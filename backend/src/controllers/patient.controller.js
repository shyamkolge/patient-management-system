import Patient from '../models/Patient.js';
import User from '../models/User.js';

/**
 * Get all patients (Admin, Doctor)
 */
export const getAllPatients = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        let query = {};

        // Build search query
        if (search) {
            const users = await User.find({
                role: 'patient',
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');

            const userIds = users.map(u => u._id);
            query.user = { $in: userIds };
        }

        const patients = await Patient.find(query)
            .populate('user', 'firstName lastName email phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Patient.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                patients,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patients',
        });
    }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('user', 'firstName lastName email phone status');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient',
        });
    }
};

/**
 * Create patient (Admin)
 */
export const createPatient = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, ...patientData } = req.body;

        // Create user account
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: 'patient',
        });

        // Create patient profile
        const patient = await Patient.create({
            user: user._id,
            ...patientData,
        });

        const populatedPatient = await Patient.findById(patient._id).populate('user', 'firstName lastName email phone');

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: populatedPatient,
        });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating patient',
            error: error.message,
        });
    }
};

/**
 * Update patient
 */
export const updatePatient = async (req, res) => {
    try {
        // Find patient first
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // If user fields are present, update User as well
        const userUpdates = {};
        if (req.body.firstName) userUpdates.firstName = req.body.firstName;
        if (req.body.lastName) userUpdates.lastName = req.body.lastName;
        if (req.body.email) userUpdates.email = req.body.email;
        if (req.body.phone) userUpdates.phone = req.body.phone;
        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(patient.user, userUpdates, { new: true, runValidators: true });
        }

        // Remove user fields from patient update
        const patientUpdates = { ...req.body };
        delete patientUpdates.firstName;
        delete patientUpdates.lastName;
        delete patientUpdates.email;
        delete patientUpdates.phone;

        // Update patient document
        await Patient.findByIdAndUpdate(
            req.params.id,
            patientUpdates,
            { new: true, runValidators: true }
        );

        // Return the latest patient with populated user
        const updatedPatient = await Patient.findById(req.params.id).populate('user', 'firstName lastName email phone');

        res.status(200).json({
            success: true,
            message: 'Patient updated successfully',
            data: updatedPatient,
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating patient',
        });
    }
};

/**
 * Delete patient (Admin)
 */
export const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Delete user account
        await User.findByIdAndDelete(patient.user);

        // Delete patient profile
        await Patient.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully',
        });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting patient',
        });
    }
};
