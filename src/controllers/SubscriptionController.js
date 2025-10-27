const { body, param } = require('express-validator');
const Subscription = require('../models/Subscription');

class SubscriptionController {
    static validateCreate = [
        body('customer_id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
        body('service_package_id').isInt({ min: 1 }).withMessage('Invalid service package ID'),
        body('installation_address').notEmpty().withMessage('Installation address is required'),
        body('installation_date').optional().isISO8601().withMessage('Invalid installation date format'),
        body('monthly_fee').isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
        body('status').optional().isIn(['pending', 'active', 'suspended', 'terminated']).withMessage('Invalid status')
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Invalid subscription ID'),
        body('installation_address').optional().notEmpty().withMessage('Installation address cannot be empty'),
        body('installation_date').optional().isISO8601().withMessage('Invalid installation date format'),
        body('monthly_fee').optional().isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
        body('status').optional().isIn(['pending', 'active', 'suspended', 'terminated']).withMessage('Invalid status')
    ];

    static validateUpdateStatus = [
        param('id').isInt({ min: 1 }).withMessage('Invalid subscription ID'),
        body('status').isIn(['pending', 'active', 'suspended', 'terminated']).withMessage('Invalid status')
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Invalid subscription ID')
    ];

    static async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const customerId = req.query.customer_id;

            let conditions = {};
            if (status) conditions.status = status;
            if (customerId) conditions.customer_id = customerId;

            const result = await Subscription.findAll(conditions, 'created_at DESC');
            
            // Manual pagination since we need detailed subscription info
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = result.slice(startIndex, endIndex);
            const totalPages = Math.ceil(result.length / limit);

            // Get detailed info for each subscription
            const detailedSubscriptions = await Promise.all(
                paginatedData.map(async (subscription) => {
                    return await Subscription.getSubscriptionWithDetails(subscription.id);
                })
            );

            res.json({
                success: true,
                message: 'Subscriptions retrieved successfully',
                data: detailedSubscriptions,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: result.length,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
            }

            res.json({
                success: true,
                message: 'Subscription retrieved successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const subscriptionData = req.body;
            const subscription = await Subscription.create(subscriptionData);

            // Get detailed subscription info
            const detailedSubscription = await Subscription.getSubscriptionWithDetails(subscription.id);

            res.status(201).json({
                success: true,
                message: 'Subscription created successfully',
                data: detailedSubscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            const updateData = req.body;

            await Subscription.update(subscriptionId, updateData);
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription updated successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            const { status } = req.body;

            await Subscription.updateStatus(subscriptionId, status);
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription status updated successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            await Subscription.delete(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getByCustomer(req, res, next) {
        try {
            const customerId = req.params.customerId;
            const subscriptions = await Subscription.getSubscriptionsByCustomer(customerId);

            res.json({
                success: true,
                message: 'Customer subscriptions retrieved successfully',
                data: subscriptions
            });
        } catch (error) {
            next(error);
        }
    }

    static async getActive(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const activeSubscriptions = await Subscription.getActiveSubscriptions();
            
            // Manual pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = activeSubscriptions.slice(startIndex, endIndex);
            const totalPages = Math.ceil(activeSubscriptions.length / limit);

            // Get detailed info for each subscription
            const detailedSubscriptions = await Promise.all(
                paginatedData.map(async (subscription) => {
                    return await Subscription.getSubscriptionWithDetails(subscription.id);
                })
            );

            res.json({
                success: true,
                message: 'Active subscriptions retrieved successfully',
                data: detailedSubscriptions,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: activeSubscriptions.length,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async stats(req, res, next) {
        try {
            const stats = await Subscription.getSubscriptionStats();

            res.json({
                success: true,
                message: 'Subscription statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    static async activate(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            await Subscription.updateStatus(subscriptionId, 'active');
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription activated successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async suspend(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            await Subscription.updateStatus(subscriptionId, 'suspended');
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription suspended successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    static async terminate(req, res, next) {
        try {
            const subscriptionId = req.params.id;
            await Subscription.updateStatus(subscriptionId, 'terminated');
            const subscription = await Subscription.getSubscriptionWithDetails(subscriptionId);

            res.json({
                success: true,
                message: 'Subscription terminated successfully',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SubscriptionController;