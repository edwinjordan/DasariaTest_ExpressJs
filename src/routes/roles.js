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

/**
 * @swagger
 * /roles/stats:
 *   get:
 *     summary: Get role statistics
 *     description: Retrieve statistics about roles (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /roles/stats - Get role statistics (Admin only)
router.get('/stats', 
    authorize(['roles.view']), 
    RoleController.getRoleStats
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve detailed information about a specific role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /roles/:id - Get role by ID
router.get('/:id', 
    RoleController.validateRoleId,
    authorize(['roles.view']), 
    RoleController.getRoleById
);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create new role
 *     description: Create a new role in the system
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Support Manager
 *               description:
 *                 type: string
 *                 example: Manager for support team with elevated permissions
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /roles - Create new role 
router.post('/', 
    RoleController.validateCreateRole,
    authorize(['roles.create']),  
    RoleController.createRole
);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update role
 *     description: Update an existing role's information
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete role
 *     description: Delete a role from the system (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /roles/{id}/assign-permissions:
 *   post:
 *     summary: Assign permissions to role
 *     description: Assign one or more permissions to a role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *                 description: Array of permission IDs to assign
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /roles/:id/assign-permissions - Assign permissions to role (Admin only)
router.post('/:id/assign-permissions', 
    RoleController.validateAssignPermissions,
    authorize(['roles.create']),
    RoleController.assignPermissions
);

/**
 * @swagger
 * /roles/{id}/remove-permissions:
 *   delete:
 *     summary: Remove permissions from role
 *     description: Remove one or more permissions from a role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *                 description: Array of permission IDs to remove
 *     responses:
 *       200:
 *         description: Permissions removed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// DELETE /roles/:id/remove-permissions - Remove permissions from role (Admin only)
router.delete('/:id/remove-permissions', 
    RoleController.validateAssignPermissions,
    authorize(['roles.delete']),
    RoleController.removePermissions
);

/**
 * @swagger
 * /roles/{id}/permissions:
 *   get:
 *     summary: Get role permissions
 *     description: Retrieve all permissions assigned to a role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /roles/:id/permissions - Get role permissions (Admin only)
router.get('/:id/permissions', 
    RoleController.validateRoleId,
    authorize(['roles.view']),
    RoleController.getRolePermissions
);

module.exports = router;