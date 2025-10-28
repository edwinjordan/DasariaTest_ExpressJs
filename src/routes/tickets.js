const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: List all tickets
 *     description: Retrieve a paginated list of all tickets
 *     tags: [Tickets]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by subject or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: List of tickets retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /tickets - List all tickets
router.get('/', 
    authorize(['tickets.view']), 
    TicketController.index
);

/**
 * @swagger
 * /tickets/stats:
 *   get:
 *     summary: Get ticket statistics
 *     description: Retrieve statistics about tickets (total, by status, by priority)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /tickets/stats - Get ticket statistics
router.get('/stats', 
    authorize(['tickets.view']), 
    TicketController.stats
);

/**
 * @swagger
 * /tickets/my:
 *   get:
 *     summary: Get my tickets
 *     description: Retrieve tickets assigned to the current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My tickets retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// GET /tickets/my - Get tickets assigned to current user
router.get('/my', 
    authorize(['tickets.view']), 
    TicketController.myTickets
);

/**
 * @swagger
 * /tickets/open:
 *   get:
 *     summary: Get open tickets
 *     description: Retrieve all tickets with open status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Open tickets retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /tickets/open - Get open tickets
router.get('/open', 
    authorize(['tickets.view']), 
    TicketController.open
);

/**
 * @swagger
 * /tickets/in-progress:
 *   get:
 *     summary: Get in-progress tickets
 *     description: Retrieve all tickets with in-progress status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: In-progress tickets retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /tickets/in-progress - Get in progress tickets
router.get('/in-progress', 
    authorize(['tickets.view']), 
    TicketController.inProgress
);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get specific ticket
 *     description: Retrieve detailed information about a specific ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /tickets/:id - Get specific ticket
router.get('/:id', 
    TicketController.validateId, 
    validate, 
    authorize(['tickets.view']), 
    TicketController.show
);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create new ticket
 *     description: Create a new support ticket
 *     tags: [Tickets]
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
 *               - category_id
 *               - subject
 *               - description
 *               - priority
 *             properties:
 *               customer_id:
 *                 type: integer
 *                 example: 1
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               subject:
 *                 type: string
 *                 example: Internet connection problem
 *               description:
 *                 type: string
 *                 example: Customer experiencing slow internet speed
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// POST /tickets - Create new ticket
router.post('/', 
    TicketController.validateCreate, 
    validate, 
    authorize(['tickets.create']), 
    TicketController.create
);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     description: Update an existing ticket's information
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete ticket
 *     description: Delete a ticket from the system
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// PUT /tickets/:id - Update ticket
router.put('/:id', 
    TicketController.validateUpdate, 
    validate, 
    authorize(['tickets.update']), 
    TicketController.update
);

// DELETE /tickets/:id - Delete ticket
router.delete('/:id', 
    TicketController.validateId, 
    validate, 
    authorize(['tickets.delete']), 
    TicketController.delete
);

/**
 * @swagger
 * /tickets/{id}/status:
 *   post:
 *     summary: Update ticket status
 *     description: Change the status of a ticket (creates status history entry)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
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
 *                 enum: [open, in_progress, resolved, closed]
 *                 example: in_progress
 *               notes:
 *                 type: string
 *                 example: Started working on the issue
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /tickets/:id/status - Update ticket status
router.post('/:id/status', 
    TicketController.validateUpdateStatus, 
    validate, 
    authorize(['tickets.update']), 
    TicketController.updateStatus
);

/**
 * @swagger
 * /tickets/{id}/assign:
 *   post:
 *     summary: Assign ticket to user
 *     description: Assign a ticket to a specific user or users
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3]
 *                 description: Array of user IDs to assign
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// POST /tickets/:id/assign - Assign ticket to user
router.post('/:id/assign', 
    TicketController.validateAssign, 
    validate, 
    authorize(['tickets.update']), 
    TicketController.assign
);

module.exports = router;