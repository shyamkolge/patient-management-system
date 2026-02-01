import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authentication middleware to verify JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};


/**
 * Optional authentication middleware
 * Does not block if no token or invalid token, just leaves req.user undefined
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        try {
            const decoded = verifyAccessToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            };
        } catch (err) {
            // Token invalid, invalid, just ignore
        }
        next();
    } catch (error) {
        next();
    }
};
