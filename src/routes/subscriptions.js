const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: List all subscriptions
 *     description: Retrieve a paginated list of all subscriptions
 *     tags: [Subscriptions]
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
 *           enum: [active, suspended, terminated]
 *     responses:
 *       200:
 *         description: List of subscriptions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /subscriptions - List all subscriptions
router.get('/', 
    authorize(['subscriptions.view']), 
    SubscriptionController.index
);

/**
 * @swagger
 * /subscriptions/stats:
 *   get:
 *     summary: Get subscription statistics
 *     description: Retrieve statistics about subscriptions (total, by status)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /subscriptions/stats - Get subscription statistics
router.get('/stats', 
    authorize(['subscriptions.view']), 
    SubscriptionController.stats
);

/**
 * @swagger
 * /subscriptions/active:
 *   get:
 *     summary: Get active subscriptions
 *     description: Retrieve all subscriptions with active status
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscriptions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /subscriptions/active - Get active subscriptions
router.get('/active', 
    authorize(['subscriptions.view']), 
    SubscriptionController.getActive
);

/**
 * @swagger
 * /subscriptions/customer/{customerId}:
 *   get:
 *     summary: Get subscriptions by customer
 *     description: Retrieve all subscriptions for a specific customer
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer subscriptions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /subscriptions/customer/:customerId - Get subscriptions by customer
router.get('/customer/:customerId', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    SubscriptionController.getByCustomer
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get specific subscription
 *     description: Retrieve detailed information about a specific subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /subscriptions/:id - Get specific subscription
router.get('/:id', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    SubscriptionController.show
);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create new subscription
 *     description: Create a new subscription for a customer
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - package_id
 *               - start_date
 *             properties:
 *               customer_id:
 *                 type: integer
 *                 example: 1
 *               package_id:
 *                 type: integer
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /subscriptions - Create new subscription
router.post('/', 
    SubscriptionController.validateCreate, 
    validate, 
    authorize(['subscriptions.create']), 
    SubscriptionController.create
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Update subscription
 *     description: Update an existing subscription's information
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               package_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete subscription
 *     description: Delete a subscription from the system
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PUT /subscriptions/:id - Update subscription
router.put('/:id', 
    SubscriptionController.validateUpdate, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.update
);

// DELETE /subscriptions/:id - Delete subscription
router.delete('/:id', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.delete']), 
    SubscriptionController.delete
);

/**
 * @swagger
 * /subscriptions/{id}/status:
 *   post:
 *     summary: Update subscription status
 *     description: Change the status of a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, terminated]
 *                 example: active
 *     responses:
 *       200:
 *         description: Subscription status updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /subscriptions/:id/status - Update subscription status
router.post('/:id/status', 
    SubscriptionController.validateUpdateStatus, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.updateStatus
);

/**
 * @swagger
 * /subscriptions/{id}/activate:
 *   post:
 *     summary: Activate subscription
 *     description: Activate a suspended or inactive subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription activated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /subscriptions/:id/activate - Activate subscription
router.post('/:id/activate', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.activate
);

/**
 * @swagger
 * /subscriptions/{id}/suspend:
 *   post:
 *     summary: Suspend subscription
 *     description: Suspend an active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription suspended successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /subscriptions/:id/suspend - Suspend subscription
router.post('/:id/suspend', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.suspend
);

/**
 * @swagger
 * /subscriptions/{id}/terminate:
 *   post:
 *     summary: Terminate subscription
 *     description: Permanently terminate a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription terminated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /subscriptions/:id/terminate - Terminate subscription
router.post('/:id/terminate', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.terminate
);

module.exports = router;