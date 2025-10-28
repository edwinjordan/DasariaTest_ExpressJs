const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieve a list of all permissions in the system (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /permissions - Get all permissions (Admin only)
router.get('/', 
    authorize(['permissions.view']), 
    PermissionController.getAllPermissions
);

/**
 * @swagger
 * /permissions/resources:
 *   get:
 *     summary: Get all unique resources
 *     description: Retrieve a list of all unique resources in permissions (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /permissions/resources - Get all unique resources (Admin only)
router.get('/resources', 
    authorize(['permissions.view']),
    PermissionController.getResources
);

/**
 * @swagger
 * /permissions/actions:
 *   get:
 *     summary: Get all available actions
 *     description: Retrieve a list of all available actions in permissions (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /permissions/actions - Get all available actions (Admin only)
router.get('/actions', 
    authorize(['permissions.view']),
    PermissionController.getActions
);

/**
 * @swagger
 * /permissions/stats:
 *   get:
 *     summary: Get permission statistics
 *     description: Retrieve statistics about permissions (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /permissions/stats - Get permission statistics (Admin only)
router.get('/stats', 
    authorize(['permissions.view']),
    PermissionController.getPermissionStats
);

/**
 * @swagger
 * /permissions/by-resource/{resource}:
 *   get:
 *     summary: Get permissions by resource
 *     description: Retrieve all permissions for a specific resource (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource name (e.g., customers, tickets, users)
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /permissions/by-resource/:resource - Get permissions by resource (Admin only)
router.get('/by-resource/:resource', 
    authorize(['permissions.view']),
    PermissionController.getPermissionsByResource
);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     description: Retrieve detailed information about a specific permission (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /permissions/:id - Get permission by ID (Admin only)
router.get('/:id', 
    PermissionController.validatePermissionId,
    authorize(['permissions.view']), 
    PermissionController.getPermissionById
);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create new permission
 *     description: Create a new permission in the system (Admin only)
 *     tags: [Permissions]
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
 *               - resource
 *               - action
 *             properties:
 *               name:
 *                 type: string
 *                 example: customers.view
 *               resource:
 *                 type: string
 *                 example: customers
 *               action:
 *                 type: string
 *                 example: view
 *               description:
 *                 type: string
 *                 example: View customer information
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /permissions - Create new permission (Admin only)
router.post('/', 
    PermissionController.validateCreatePermission,
    authorize(['permissions.create']), 
    PermissionController.createPermission
);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update permission
 *     description: Update an existing permission (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete permission
 *     description: Delete a permission from the system (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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