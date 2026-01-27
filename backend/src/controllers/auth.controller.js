import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, ...additionalData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: role || 'patient',
            phone: additionalData.phone,
        });

        // Create role-specific profile
        if (user.role === 'patient' && additionalData.patientData) {
            await Patient.create({
                user: user._id,
                ...additionalData.patientData,
            });
        } else if (user.role === 'doctor' && additionalData.doctorData) {
            await Doctor.create({
                user: user._id,
                ...additionalData.doctorData,
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
        });

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message,
        });
    }
};

/**
 * Login user
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended',
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user._id,
        });

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message,
        });
    }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
            },
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
    }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Clear refresh token
        await User.findByIdAndUpdate(userId, { refreshToken: null });

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get role-specific data
        let profileData = null;
        if (user.role === 'patient') {
            profileData = await Patient.findOne({ user: user._id });
        } else if (user.role === 'doctor') {
            profileData = await Doctor.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    phone: user.phone,
                    status: user.status,
                },
                profile: profileData,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
        });
    }
};
