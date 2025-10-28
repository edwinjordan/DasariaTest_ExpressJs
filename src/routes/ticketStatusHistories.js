const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const TicketStatusHistoryController = require('../controllers/TicketStatusHistoryController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /ticket-status-histories/stats:
 *   get:
 *     summary: Get statistics
 *     description: Retrieve statistics about ticket status history
 *     tags: [Ticket Status Histories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /ticket-status-histories/stats - Get statistics
router.get('/stats',
    authorize(['tickets.view']),
    TicketStatusHistoryController.getStats
);

/**
 * @swagger
 * /ticket-status-histories/ticket/{ticketId}:
 *   get:
 *     summary: Get history by ticket
 *     description: Retrieve all status history entries for a specific ticket
 *     tags: [Ticket Status Histories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket status history retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /ticket-status-histories/ticket/:ticketId - Get history by ticket
router.get('/ticket/:ticketId',
    TicketStatusHistoryController.validateTicketId,
    validate,
    authorize(['tickets.view']),
    TicketStatusHistoryController.getByTicket
);

/**
 * @swagger
 * /ticket-status-histories:
 *   get:
 *     summary: Get all histories
 *     description: Retrieve a paginated list of all ticket status history entries
 *     tags: [Ticket Status Histories]
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
 *         description: List of status histories retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// GET /ticket-status-histories - Get all histories
router.get('/',
    authorize(['tickets.view']),
    TicketStatusHistoryController.index
);

/**
 * @swagger
 * /ticket-status-histories/{id}:
 *   get:
 *     summary: Get specific history entry
 *     description: Retrieve detailed information about a specific status history entry
 *     tags: [Ticket Status Histories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History entry ID
 *     responses:
 *       200:
 *         description: Status history entry retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// GET /ticket-status-histories/:id - Get specific history entry
router.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('Valid history ID is required'),
    validate,
    authorize(['tickets.view']),
    TicketStatusHistoryController.show
);

module.exports = router;
