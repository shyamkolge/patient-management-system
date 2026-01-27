import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });
};

/**
 * Verify JWT access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
