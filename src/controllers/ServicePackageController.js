const { body, param } = require('express-validator');
const ServicePackage = require('../models/ServicePackage');
const ServicePackageRepository = require('../repositories/ServicePackageRepository');


class ServicePackageController {
    static validateCreate = [
        body('name').notEmpty().withMessage('Package name is required'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('speed_mbps').isInt({ min: 1 }).withMessage('Speed must be a positive integer'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Invalid service package ID'),
        body('name').optional().notEmpty().withMessage('Package name cannot be empty'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('speed_mbps').optional().isInt({ min: 1 }).withMessage('Speed must be a positive integer'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Invalid service package ID')
    ];

    static async index(req, res, next) {
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            
            let result;
            if (search) {
                result = await ServicePackageRepository.searchPackages(search, page, limit);
            } else {
                result = await ServicePackageRepository.paginate(page, limit, {}, 'name ASC');
            }
                        
            res.json({
                success: true,
                message: 'Service packages retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
            
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const packageId = req.params.id;
            const servicePackage = await ServicePackage.getPackageWithSubscriptionCount(packageId);

            if (!servicePackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Service package not found'
                });
            }

            res.json({
                success: true,
                message: 'Service package retrieved successfully',
                data: servicePackage
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const packageData = req.body;
            const servicePackage = await ServicePackage.create(packageData);

            res.status(201).json({
                success: true,
                message: 'Service package created successfully',
                data: servicePackage
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const packageId = req.params.id;
            const updateData = req.body;

            const servicePackage = await ServicePackage.update(packageId, updateData);

            res.json({
                success: true,
                message: 'Service package updated successfully',
                data: servicePackage
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const packageId = req.params.id;
            
            // Check if package has active subscriptions
            const packageWithStats = await ServicePackage.getPackageWithSubscriptionCount(packageId);
            if (packageWithStats && packageWithStats.subscription_count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete service package with existing subscriptions',
                    active_subscriptions: packageWithStats.subscription_count
                });
            }

            await ServicePackage.delete(packageId);

            res.json({
                success: true,
                message: 'Service package deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async activate(req, res, next) {
        try {
            const packageId = req.params.id;
            const servicePackage = await ServicePackage.update(packageId, { is_active: true });

            res.json({
                success: true,
                message: 'Service package activated successfully',
                data: servicePackage
            });
        } catch (error) {
            next(error);
        }
    }

    static async deactivate(req, res, next) {
        try {
            const packageId = req.params.id;
            const servicePackage = await ServicePackage.update(packageId, { is_active: false });

            res.json({
                success: true,
                message: 'Service package deactivated successfully',
                data: servicePackage
            });
        } catch (error) {
            next(error);
        }
    }

    static async stats(req, res, next) {
        try {
            const packages = await ServicePackage.getAllPackagesWithStats();
            
            const stats = {
                total_packages: packages.length,
                active_packages: packages.filter(p => p.is_active).length,
                inactive_packages: packages.filter(p => !p.is_active).length,
                total_subscriptions: packages.reduce((sum, p) => sum + p.subscription_count, 0),
                active_subscriptions: packages.reduce((sum, p) => sum + p.active_subscriptions, 0),
                packages_by_speed: packages.map(p => ({
                    id: p.id,
                    name: p.name,
                    speed_mbps: p.speed_mbps,
                    price: p.price,
                    subscription_count: p.subscription_count
                })).sort((a, b) => a.speed_mbps - b.speed_mbps)
            };

            res.json({
                success: true,
                message: 'Service package statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ServicePackageController;