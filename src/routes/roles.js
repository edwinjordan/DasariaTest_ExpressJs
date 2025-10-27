const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /roles - Get all roles (Admin only)
router.get('/', 
    authorize(['roles.view']), 
    RoleController.getAllRoles
);

// GET /roles/stats - Get role statistics (Admin only)
router.get('/stats', 
    authorize(['roles.view']), 
    RoleController.getRoleStats
);

// GET /roles/:id - Get role by ID
router.get('/:id', 
    RoleController.validateRoleId,
    authorize(['roles.view']), 
    RoleController.getRoleById
);

// POST /roles - Create new role 
router.post('/', 
    RoleController.validateCreateRole,
    authorize(['roles.create']),  
    RoleController.createRole
);

// PUT /roles/:id - Update role
router.put('/:id', 
    RoleController.validateUpdateRole,
    authorize(['roles.update']), 
    RoleController.updateRole
);

// DELETE /roles/:id - Delete role (Admin only)
router.delete('/:id', 
    RoleController.validateRoleId,
    authorize(['roles.delete']),
    RoleController.deleteRole
);

// POST /roles/:id/assign-permissions - Assign permissions to role (Admin only)
router.post('/:id/assign-permissions', 
    RoleController.validateAssignPermissions,
    authorize(['roles.create']),
    RoleController.assignPermissions
);

// DELETE /roles/:id/remove-permissions - Remove permissions from role (Admin only)
router.delete('/:id/remove-permissions', 
    RoleController.validateAssignPermissions,
    authorize(['roles.delete']),
    RoleController.removePermissions
);

// GET /roles/:id/permissions - Get role permissions (Admin only)
router.get('/:id/permissions', 
    RoleController.validateRoleId,
    authorize(['roles.view']),
    RoleController.getRolePermissions
);

module.exports = router;