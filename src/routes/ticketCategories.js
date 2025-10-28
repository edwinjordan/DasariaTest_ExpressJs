const express = require('express');
const router = express.Router();
const TicketCategoryController = require('../controllers/TicketCategoryController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /ticket-categories/stats:
 *   get:
 *     summary: Get category statistics
 *     description: Retrieve statistics about ticket categories
 *     tags: [Ticket Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /ticket-categories/stats - Get category statistics
router.get('/stats', 
    authorize(['ticketcategories.view']),
    TicketCategoryController.stats
);

/**
 * @swagger
 * /ticket-categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all ticket categories
 *     tags: [Ticket Categories]
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
 *     responses:
 *       200:
 *         description: List of ticket categories retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /ticket-categories - Get all categories
router.get('/',
    authorize(['ticketcategories.view']),
    TicketCategoryController.index
);

/**
 * @swagger
 * /ticket-categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve detailed information about a specific ticket category
 *     tags: [Ticket Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /ticket-categories/:id - Get category by ID
router.get('/:id',
    TicketCategoryController.validateId,
    validate,
    authorize(['ticketcategories.view']),
    TicketCategoryController.show
);

/**
 * @swagger
 * /ticket-categories:
 *   post:
 *     summary: Create new category
 *     description: Create a new ticket category
 *     tags: [Ticket Categories]
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
 *                 example: Technical Issue
 *               description:
 *                 type: string
 *                 example: Technical problems and internet connectivity issues
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /ticket-categories - Create new category
router.post('/',
    TicketCategoryController.validateCreate,
    validate,
    authorize(['ticketcategories.create']),
    TicketCategoryController.create
);

/**
 * @swagger
 * /ticket-categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update an existing ticket category
 *     tags: [Ticket Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
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
 *         description: Category updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete category
 *     description: Delete a ticket category from the system
 *     tags: [Ticket Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PUT /ticket-categories/:id - Update category
router.put('/:id',
    TicketCategoryController.validateUpdate,
    validate,
    authorize(['ticketcategories.update']),
    TicketCategoryController.update
);

// DELETE /ticket-categories/:id - Delete category
router.delete('/:id',
    TicketCategoryController.validateId,
    validate,
    authorize(['ticketcategories.delete']),
    TicketCategoryController.destroy
);

module.exports = router;
