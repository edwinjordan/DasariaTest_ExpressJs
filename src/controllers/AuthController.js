const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const UserRepository = require('../repositories/UserRepository');

class AuthController {
    static validateLogin = [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ];

    static validateRegister = [
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
        body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
    ];

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Verify password
            const isValidPassword = await UserRepository.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Get user with roles and permissions
            const userWithRoles = await UserRepository.getUserWithRoles(user.id);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Remove password from response
            const { password: _, ...userResponse } = userWithRoles;

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async register(req, res, next) {
        try {
            const { username, email, password, full_name, phone } = req.body;

            // Create user
            const userData = {
                username,
                email,
                password,
                full_name,
                phone,
                is_active: true
            };

            const user = await UserRepository.createUser(userData);

            // Assign default role (Customer Service) to new users
            const defaultRoleId = 3; // Customer Service role
            await UserRepository.assignRole(user.id, defaultRoleId);

            // Get user with roles
            const userWithRoles = await UserRepository.getUserWithRoles(user.id);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Remove password from response
            const { password: _, ...userResponse } = userWithRoles;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async me(req, res, next) {
        try {
            const user = req.user;
            const { password: _, ...userResponse } = user;

            res.json({
                success: true,
                message: 'User profile retrieved successfully',
                data: userResponse
            });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req, res, next) {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.user.id;

            // Get current user
            const user = await UserRepository.findById(userId);

            // Verify current password
            const isValidPassword = await UserRepository.verifyPassword(current_password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            await UserRepository.updatePassword(userId, new_password);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static validateChangePassword = [
        body('current_password').notEmpty().withMessage('Current password is required'),
        body('new_password')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long')
    ];
}

module.exports = AuthController;