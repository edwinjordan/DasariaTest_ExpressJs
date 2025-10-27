const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /subscriptions - List all subscriptions
router.get('/', 
    authorize(['subscriptions.view']), 
    SubscriptionController.index
);

// GET /subscriptions/stats - Get subscription statistics
router.get('/stats', 
    authorize(['subscriptions.view']), 
    SubscriptionController.stats
);

// GET /subscriptions/active - Get active subscriptions
router.get('/active', 
    authorize(['subscriptions.view']), 
    SubscriptionController.getActive
);

// GET /subscriptions/customer/:customerId - Get subscriptions by customer
router.get('/customer/:customerId', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    SubscriptionController.getByCustomer
);

// GET /subscriptions/:id - Get specific subscription
router.get('/:id', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    SubscriptionController.show
);

// POST /subscriptions - Create new subscription
router.post('/', 
    SubscriptionController.validateCreate, 
    validate, 
    authorize(['subscriptions.create']), 
    SubscriptionController.create
);

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

// POST /subscriptions/:id/status - Update subscription status
router.post('/:id/status', 
    SubscriptionController.validateUpdateStatus, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.updateStatus
);

// POST /subscriptions/:id/activate - Activate subscription
router.post('/:id/activate', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.activate
);

// POST /subscriptions/:id/suspend - Suspend subscription
router.post('/:id/suspend', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.suspend
);

// POST /subscriptions/:id/terminate - Terminate subscription
router.post('/:id/terminate', 
    SubscriptionController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    SubscriptionController.terminate
);

module.exports = router;