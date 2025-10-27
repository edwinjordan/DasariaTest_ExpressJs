const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /customers - List all customers
router.get('/', 
    authorize(['customers.view']), 
    CustomerController.index
);

// GET /customers/stats - Get customer statistics
router.get('/stats', 
    authorize(['customers.view']), 
    CustomerController.stats
);

// GET /customers/active - Get active customers
router.get('/active', 
    authorize(['customers.view']), 
    CustomerController.active
);

// GET /customers/:id - Get specific customer
router.get('/:id', 
    CustomerController.validateId, 
    validate, 
    authorize(['customers.view']), 
    CustomerController.show
);

// POST /customers - Create new customer
router.post('/', 
    CustomerController.validateCreate, 
    validate, 
    authorize(['customers.create']), 
    CustomerController.create
);

// PUT /customers/:id - Update customer
router.put('/:id', 
    CustomerController.validateUpdate, 
    validate, 
    authorize(['customers.update']), 
    CustomerController.update
);

// DELETE /customers/:id - Delete customer
router.delete('/:id', 
    CustomerController.validateId, 
    validate, 
    authorize(['customers.delete']), 
    CustomerController.delete
);

// POST /customers/:id/activate - Activate customer
router.post('/:id/activate', 
    CustomerController.validateId, 
    validate, 
    authorize(['customers.update']), 
    CustomerController.activate
);

// POST /customers/:id/deactivate - Deactivate customer
router.post('/:id/deactivate', 
    CustomerController.validateId, 
    validate, 
    authorize(['customers.update']), 
    CustomerController.deactivate
);

module.exports = router;