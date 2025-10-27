const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /tickets - List all tickets
router.get('/', 
    authorize(['tickets.view']), 
    TicketController.index
);

// GET /tickets/stats - Get ticket statistics
router.get('/stats', 
    authorize(['tickets.view']), 
    TicketController.stats
);

// GET /tickets/my - Get tickets assigned to current user
router.get('/my', 
    authorize(['tickets.view']), 
    TicketController.myTickets
);

// GET /tickets/open - Get open tickets
router.get('/open', 
    authorize(['tickets.view']), 
    TicketController.open
);

// GET /tickets/in-progress - Get in progress tickets
router.get('/in-progress', 
    authorize(['tickets.view']), 
    TicketController.inProgress
);

// GET /tickets/:id - Get specific ticket
router.get('/:id', 
    TicketController.validateId, 
    validate, 
    authorize(['tickets.view']), 
    TicketController.show
);

// POST /tickets - Create new ticket
router.post('/', 
    TicketController.validateCreate, 
    validate, 
    authorize(['tickets.create']), 
    TicketController.create
);

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

// POST /tickets/:id/status - Update ticket status
router.post('/:id/status', 
    TicketController.validateUpdateStatus, 
    validate, 
    authorize(['tickets.update']), 
    TicketController.updateStatus
);

// POST /tickets/:id/assign - Assign ticket to user
router.post('/:id/assign', 
    TicketController.validateAssign, 
    validate, 
    authorize(['tickets.update']), 
    TicketController.assign
);

module.exports = router;