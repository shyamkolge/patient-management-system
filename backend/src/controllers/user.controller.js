import User from '../models/User.js';

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
        });
    }
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
        });
    }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (req, res) => {
    try {
        // Don't allow password update through this endpoint
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
        });
    }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
        });
    }
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'doctor', 'patient'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: user,
        });
    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user role',
        });
    }
};
