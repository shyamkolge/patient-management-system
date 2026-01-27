/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Check if user is doctor
 */
export const isDoctor = authorize('doctor');

/**
 * Check if user is patient
 */
export const isPatient = authorize('patient');

/**
 * Check if user is admin or doctor
 */
export const isAdminOrDoctor = authorize('admin', 'doctor');
