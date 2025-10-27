const UserRepository = require('../repositories/UserRepository');

const authorize = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            // Check if user has required permissions
            const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
            const hasPermission = await Promise.all(
                requiredPermissions.map(permission => 
                    UserRepository.hasPermission(req.user.id, permission)
                )
            );

            // User needs at least one of the required permissions
            if (!hasPermission.some(Boolean)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions.',
                    required_permissions: requiredPermissions
                });
            }

            next();
        } catch (error) {
            console.error('Authorization middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed.'
            });
        }
    };
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            const requiredRoles = Array.isArray(roles) ? roles : [roles];
            const userRoles = req.user.roles || [];
            
            // Check if user has at least one of the required roles
            const hasRole = requiredRoles.some(role => userRoles.includes(role));
            
            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient role permissions.',
                    required_roles: requiredRoles,
                    user_roles: userRoles
                });
            }

            next();
        } catch (error) {
            console.error('Role authorization middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Role authorization check failed.'
            });
        }
    };
};

module.exports = {
    authorize,
    authorizeRoles
};