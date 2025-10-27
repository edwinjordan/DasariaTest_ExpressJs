const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /users - List all users (Admin only)
router.get('/', 
    authorize(['users.view']), 
    UserController.index
);

// GET /users/:id - Get specific user (Admin only)
router.get('/:id', 
    UserController.validateId, 
    validate, 
    authorize(['users.view']), 
    UserController.show
);

// POST /users - Create new user (Admin only)
router.post('/', 
    UserController.validateCreate, 
    validate, 
    authorize(['users.create']), 
    UserController.create
);

// PUT /users/:id - Update user (Admin only)
router.put('/:id', 
    UserController.validateUpdate, 
    validate, 
    authorize(['users.update']), 
    UserController.update
);

// DELETE /users/:id - Delete user (Admin only)
router.delete('/:id', 
    UserController.validateId, 
    validate, 
    authorize(['users.delete']), 
    UserController.delete
);

// POST /users/:id/assign-role - Assign role to user (Admin only)
router.post('/:id/assign-role', 
    UserController.validateAssignRole, 
    validate, 
    authorize(['users.update']), 
    UserController.assignRole
);

// DELETE /users/:id/remove-role - Remove role from user (Admin only)
router.delete('/:id/remove-role', 
    UserController.validateAssignRole, 
    validate, 
    authorize(['users.update']), 
    UserController.removeRole
);

// GET /users/:id/roles - Get user roles (Admin only)
router.get('/:id/roles', 
    UserController.validateId, 
    validate, 
    authorize(['users.view']), 
    UserController.getUserRoles
);

// GET /users/:id/permissions - Get user permissions (Admin only)
router.get('/:id/permissions', 
    UserController.validateId, 
    validate, 
    authorize(['users.view']), 
    UserController.getUserPermissions
);

module.exports = router;