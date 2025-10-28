const express = require('express');
const router = express.Router();
const ServicePackageController = require('../controllers/ServicePackageController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /service-packages:
 *   get:
 *     summary: List all service packages
 *     description: Retrieve a list of all available service packages
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: List of service packages retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /service-packages - List all service packages
router.get('/', 
    authorize(['subscriptions.view']), 
    ServicePackageController.index
);

/**
 * @swagger
 * /service-packages/stats:
 *   get:
 *     summary: Get service package statistics
 *     description: Retrieve statistics about service packages
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service package statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /service-packages/stats - Get service package statistics
router.get('/stats', 
    authorize(['subscriptions.view']), 
    ServicePackageController.stats
);

/**
 * @swagger
 * /service-packages/{id}:
 *   get:
 *     summary: Get specific service package
 *     description: Retrieve detailed information about a specific service package
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Service package retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /service-packages/:id - Get specific service package
router.get('/:id', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    ServicePackageController.show
);

/**
 * @swagger
 * /service-packages:
 *   post:
 *     summary: Create new service package
 *     description: Create a new service package (Admin only)
 *     tags: [Service Packages]
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
 *               - price
 *               - speed
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium 100Mbps
 *               description:
 *                 type: string
 *                 example: High-speed internet package with 100Mbps download speed
 *               price:
 *                 type: number
 *                 example: 500000
 *               speed:
 *                 type: string
 *                 example: 100Mbps
 *               quota:
 *                 type: string
 *                 example: Unlimited
 *     responses:
 *       201:
 *         description: Service package created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /service-packages - Create new service package (Admin only)
router.post('/', 
    ServicePackageController.validateCreate, 
    validate, 
    authorize(['subscriptions.create']), 
    ServicePackageController.create
);

/**
 * @swagger
 * /service-packages/{id}:
 *   put:
 *     summary: Update service package
 *     description: Update an existing service package (Admin only)
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service package ID
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
 *               price:
 *                 type: number
 *               speed:
 *                 type: string
 *               quota:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service package updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete service package
 *     description: Delete a service package from the system (Admin only)
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Service package deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PUT /service-packages/:id - Update service package (Admin only)
router.put('/:id', 
    ServicePackageController.validateUpdate, 
    validate, 
    authorize(['subscriptions.update']), 
    ServicePackageController.update
);

// DELETE /service-packages/:id - Delete service package (Admin only)
router.delete('/:id', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.delete']), 
    ServicePackageController.delete
);

/**
 * @swagger
 * /service-packages/{id}/activate:
 *   post:
 *     summary: Activate service package
 *     description: Activate an inactive service package
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Service package activated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /service-packages/:id/activate - Activate service package
router.post('/:id/activate', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    ServicePackageController.activate
);

/**
 * @swagger
 * /service-packages/{id}/deactivate:
 *   post:
 *     summary: Deactivate service package
 *     description: Deactivate an active service package
 *     tags: [Service Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service package ID
 *     responses:
 *       200:
 *         description: Service package deactivated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /service-packages/:id/deactivate - Deactivate service package
router.post('/:id/deactivate', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    ServicePackageController.deactivate
);

module.exports = router;