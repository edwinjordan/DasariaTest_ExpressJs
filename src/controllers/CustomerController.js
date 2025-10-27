const { body, param } = require('express-validator');
const CustomerRepository = require('../repositories/CustomerRepository');

class CustomerController {
    static validateCreate = [
        body('full_name').notEmpty().withMessage('Full name is required'),
        body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
        body('address').notEmpty().withMessage('Address is required'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('id_number').optional().isLength({ min: 16, max: 16 }).withMessage('ID number must be 16 digits')
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
        body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
        body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
        body('address').optional().notEmpty().withMessage('Address cannot be empty'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('id_number').optional().isLength({ min: 16, max: 16 }).withMessage('ID number must be 16 digits'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Invalid customer ID')
    ];

    static async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;

            let result;
            if (search) {
                result = await CustomerRepository.searchCustomers(search, page, limit);
            } else {
                result = await CustomerRepository.paginate(page, limit, {}, 'full_name ASC');
            }

            res.json({
                success: true,
                message: 'Customers retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const customerId = req.params.id;
            const customer = await CustomerRepository.getCustomerWithSubscriptions(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            res.json({
                success: true,
                message: 'Customer retrieved successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const customerData = req.body;
            const customer = await CustomerRepository.createCustomer(customerData);

            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const customerId = req.params.id;
            const updateData = req.body;

            const customer = await CustomerRepository.update(customerId, updateData);

            res.json({
                success: true,
                message: 'Customer updated successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const customerId = req.params.id;
            await CustomerRepository.delete(customerId);

            res.json({
                success: true,
                message: 'Customer deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async activate(req, res, next) {
        try {
            const customerId = req.params.id;
            const customer = await CustomerRepository.activateCustomer(customerId);

            res.json({
                success: true,
                message: 'Customer activated successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }

    static async deactivate(req, res, next) {
        try {
            const customerId = req.params.id;
            const customer = await CustomerRepository.deactivateCustomer(customerId);

            res.json({
                success: true,
                message: 'Customer deactivated successfully',
                data: customer
            });
        } catch (error) {
            next(error);
        }
    }

    static async stats(req, res, next) {
        try {
            const stats = await CustomerRepository.getCustomerStats();

            res.json({
                success: true,
                message: 'Customer statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    static async active(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await CustomerRepository.paginate(page, limit, { is_active: true }, 'full_name ASC');

            res.json({
                success: true,
                message: 'Active customers retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CustomerController;