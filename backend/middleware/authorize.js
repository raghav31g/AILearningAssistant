import SystemSettings from '../models/SystemSettings.js';

/**
 * Middleware to restrict route access to specific user roles
 * @param  {...string} roles - Allowed roles (e.g. 'administrator', 'teacher', 'student')
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
                statusCode: 401
            });
        }

        const userRole = req.user.role || 'student';

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`,
                statusCode: 403
            });
        }

        next();
    };
};

/**
 * Middleware to block student write/creation actions if Protected Mode is activated
 */
export const checkProtectedMode = async (req, res, next) => {
    try {
        const userRole = req.user?.role || 'student';

        // Only students are restricted in Protected Mode
        if (userRole === 'student') {
            const setting = await SystemSettings.findOne({ key: 'protectedMode' });
            if (setting && setting.value === true) {
                return res.status(403).json({
                    success: false,
                    error: 'Protected Mode is currently enabled by the Administrator. AI generation, document uploads, and quiz creation are temporarily restricted for students.',
                    isProtectedMode: true,
                    statusCode: 403
                });
            }
        }

        next();
    } catch (error) {
        console.error('Protected mode check error:', error);
        next(); // Proceed if check fails to avoid crashing
    }
};
