const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const TicketStatusHistoryController = require('../controllers/TicketStatusHistoryController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /ticket-status-histories/stats - Get statistics
router.get('/stats',
    authorize(['tickets.view']),
    TicketStatusHistoryController.getStats
);

// GET /ticket-status-histories/ticket/:ticketId - Get history by ticket
router.get('/ticket/:ticketId',
    TicketStatusHistoryController.validateTicketId,
    validate,
    authorize(['tickets.view']),
    TicketStatusHistoryController.getByTicket
);

// GET /ticket-status-histories - Get all histories
router.get('/',
    authorize(['tickets.view']),
    TicketStatusHistoryController.index
);

// GET /ticket-status-histories/:id - Get specific history entry
router.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('Valid history ID is required'),
    validate,
    authorize(['tickets.view']),
    TicketStatusHistoryController.show
);

module.exports = router;
