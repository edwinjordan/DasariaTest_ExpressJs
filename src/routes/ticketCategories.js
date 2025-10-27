const express = require('express');
const router = express.Router();
const TicketCategoryController = require('../controllers/TicketCategoryController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /ticket-categories/stats - Get category statistics
router.get('/stats', 
    authorize(['ticketcategories.view']),
    TicketCategoryController.stats
);

// GET /ticket-categories - Get all categories
router.get('/',
    authorize(['ticketcategories.view']),
    TicketCategoryController.index
);

// GET /ticket-categories/:id - Get category by ID
router.get('/:id',
    TicketCategoryController.validateId,
    validate,
    authorize(['ticketcategories.view']),
    TicketCategoryController.show
);

// POST /ticket-categories - Create new category
router.post('/',
    TicketCategoryController.validateCreate,
    validate,
    authorize(['ticketcategories.create']),
    TicketCategoryController.create
);

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
