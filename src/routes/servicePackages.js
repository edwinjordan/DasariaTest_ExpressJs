const express = require('express');
const router = express.Router();
const ServicePackageController = require('../controllers/ServicePackageController');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

// Apply authentication to all routes
router.use(authMiddleware);

// GET /service-packages - List all service packages
router.get('/', 
    authorize(['subscriptions.view']), 
    ServicePackageController.index
);

// GET /service-packages/stats - Get service package statistics
router.get('/stats', 
    authorize(['subscriptions.view']), 
    ServicePackageController.stats
);

// GET /service-packages/:id - Get specific service package
router.get('/:id', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.view']), 
    ServicePackageController.show
);

// POST /service-packages - Create new service package (Admin only)
router.post('/', 
    ServicePackageController.validateCreate, 
    validate, 
    authorize(['subscriptions.create']), 
    ServicePackageController.create
);

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

// POST /service-packages/:id/activate - Activate service package
router.post('/:id/activate', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    ServicePackageController.activate
);

// POST /service-packages/:id/deactivate - Deactivate service package
router.post('/:id/deactivate', 
    ServicePackageController.validateId, 
    validate, 
    authorize(['subscriptions.update']), 
    ServicePackageController.deactivate
);

module.exports = router;