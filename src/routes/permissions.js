const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /permissions - Get all permissions (Admin only)
router.get('/', 
    authorize(['permissions.view']), 
    PermissionController.getAllPermissions
);

// GET /permissions/resources - Get all unique resources (Admin only)
router.get('/resources', 
    authorize(['permissions.view']),
    PermissionController.getResources
);

// GET /permissions/actions - Get all available actions (Admin only)
router.get('/actions', 
    authorize(['permissions.view']),
    PermissionController.getActions
);

// GET /permissions/stats - Get permission statistics (Admin only)
router.get('/stats', 
    authorize(['permissions.view']),
    PermissionController.getPermissionStats
);

// GET /permissions/by-resource/:resource - Get permissions by resource (Admin only)
router.get('/by-resource/:resource', 
    authorize(['permissions.view']),
    PermissionController.getPermissionsByResource
);

// GET /permissions/:id - Get permission by ID (Admin only)
router.get('/:id', 
    PermissionController.validatePermissionId,
    authorize(['permissions.view']), 
    PermissionController.getPermissionById
);

// POST /permissions - Create new permission (Admin only)
router.post('/', 
    PermissionController.validateCreatePermission,
    authorize(['permissions.create']), 
    PermissionController.createPermission
);

// PUT /permissions/:id - Update permission (Admin only)
router.put('/:id', 
    PermissionController.validateUpdatePermission,
    authorize(['permissions.update']),
    PermissionController.updatePermission
);

// DELETE /permissions/:id - Delete permission (Admin only)
router.delete('/:id', 
    PermissionController.validatePermissionId,
    authorize(['permissions.delete']),
    PermissionController.deletePermission
);

module.exports = router;