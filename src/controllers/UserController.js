const { body, param, query } = require('express-validator');
const UserRepository = require('../repositories/UserRepository');

class UserController {
    static validateCreate = [
        body('username')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('full_name').notEmpty().withMessage('Full name is required'),
        body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
        body('username')
            .optional()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
        body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Invalid user ID')
    ];

    static validateAssignRole = [
        param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
        body('role_id').isInt({ min: 1 }).withMessage('Invalid role ID')
    ];

    static async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;

            let result;
            if (search) {
                result = await UserRepository.searchUsers(search, page, limit);
            } else {
                result = await UserRepository.paginate(page, limit, {}, 'full_name ASC');
            }

            // Remove passwords from response
            result.data = result.data.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const userId = req.params.id;
            const user = await UserRepository.getUserWithRoles(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const { password, ...userResponse } = user;

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: userResponse
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const userData = req.body;
            const user = await UserRepository.createUser(userData);

            const { password, ...userResponse } = user;

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: userResponse
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const userId = req.params.id;
            const updateData = req.body;

            // Remove password from update data if present
            delete updateData.password;

            const user = await UserRepository.update(userId, updateData);
            const { password, ...userResponse } = user;

            res.json({
                success: true,
                message: 'User updated successfully',
                data: userResponse
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const userId = req.params.id;
            
            // Prevent user from deleting themselves
            if (parseInt(userId) === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot delete your own account'
                });
            }

            await UserRepository.delete(userId);

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async assignRole(req, res, next) {
        try {
            const userId = req.params.id;
            const { role_id } = req.body;
            
            await UserRepository.assignRole(userId, role_id);

            res.json({
                success: true,
                message: 'Role assigned successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async removeRole(req, res, next) {
        try {
            const userId = req.params.id;
            const { role_id } = req.body;

            await UserRepository.removeRole(userId, role_id);

            res.json({
                success: true,
                message: 'Role removed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserRoles(req, res, next) {
        try {
            const userId = req.params.id;
            const roles = await UserRepository.getUserRoles(userId);

            res.json({
                success: true,
                message: 'User roles retrieved successfully',
                data: roles
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserPermissions(req, res, next) {
        try {
            const userId = req.params.id;
            const permissions = await UserRepository.getUserPermissions(userId);

            res.json({
                success: true,
                message: 'User permissions retrieved successfully',
                data: permissions
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;