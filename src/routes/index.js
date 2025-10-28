const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const customerRoutes = require('./customers');
const ticketRoutes = require('./tickets');
const subscriptionRoutes = require('./subscriptions');
const servicePackageRoutes = require('./servicePackages');
const roleRoutes = require('./roles');
const permissionRoutes = require('./permissions');
const ticketCategoryRoutes = require('./ticketCategories');
const ticketStatusHistoryRoutes = require('./ticketStatusHistories');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/tickets', ticketRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/service-packages', servicePackageRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/ticket-categories', ticketCategoryRoutes);
router.use('/ticket-status-histories', ticketStatusHistoryRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ISP Management API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'ISP Management System API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'User login',
                'POST /api/auth/register': 'User registration',
                'GET /api/auth/me': 'Get current user profile',
                'POST /api/auth/change-password': 'Change password'
            },
            users: {
                'GET /api/users': 'List all users (Admin only)',
                'GET /api/users/:id': 'Get user by ID (Admin only)',
                'POST /api/users': 'Create new user (Admin only)',
                'PUT /api/users/:id': 'Update user (Admin only)',
                'DELETE /api/users/:id': 'Delete user (Admin only)',
                'POST /api/users/:id/assign-role': 'Assign role to user (Admin only)',
                'DELETE /api/users/:id/remove-role': 'Remove role from user (Admin only)',
                'GET /api/users/:id/roles': 'Get user roles (Admin only)',
                'GET /api/users/:id/permissions': 'Get user permissions (Admin only)'
            },
            customers: {
                'GET /api/customers': 'List all customers',
                'GET /api/customers/stats': 'Get customer statistics',
                'GET /api/customers/active': 'Get active customers',
                'GET /api/customers/:id': 'Get customer by ID',
                'POST /api/customers': 'Create new customer',
                'PUT /api/customers/:id': 'Update customer',
                'DELETE /api/customers/:id': 'Delete customer',
                'POST /api/customers/:id/activate': 'Activate customer',
                'POST /api/customers/:id/deactivate': 'Deactivate customer'
            },
            tickets: {
                'GET /api/tickets': 'List all tickets',
                'GET /api/tickets/stats': 'Get ticket statistics',
                'GET /api/tickets/my': 'Get my assigned tickets',
                'GET /api/tickets/open': 'Get open tickets',
                'GET /api/tickets/in-progress': 'Get in progress tickets',
                'GET /api/tickets/:id': 'Get ticket by ID',
                'POST /api/tickets': 'Create new ticket',
                'PUT /api/tickets/:id': 'Update ticket',
                'DELETE /api/tickets/:id': 'Delete ticket',
                'POST /api/tickets/:id/status': 'Update ticket status',
                'POST /api/tickets/:id/assign': 'Assign ticket to user'
            },
            ticketCategories: {
                'GET /api/ticket-categories': 'List all ticket categories',
                'GET /api/ticket-categories/stats': 'Get category statistics',
                'GET /api/ticket-categories/:id': 'Get category by ID',
                'POST /api/ticket-categories': 'Create new category (Admin/Agent NOC)',
                'PUT /api/ticket-categories/:id': 'Update category (Admin/Agent NOC)',
                'DELETE /api/ticket-categories/:id': 'Delete category (Admin only)'
            },
            ticketStatusHistories: {
                'GET /api/ticket-status-histories': 'List all status history records',
                'GET /api/ticket-status-histories/stats': 'Get status change statistics',
                'GET /api/ticket-status-histories/recent': 'Get recent status changes',
                'GET /api/ticket-status-histories/ticket/:ticketId': 'Get history for specific ticket',
                'GET /api/ticket-status-histories/:id': 'Get specific history entry'
            },
            subscriptions: {
                'GET /api/subscriptions': 'List all subscriptions',
                'GET /api/subscriptions/stats': 'Get subscription statistics',
                'GET /api/subscriptions/active': 'Get active subscriptions',
                'GET /api/subscriptions/customer/:customerId': 'Get subscriptions by customer',
                'GET /api/subscriptions/:id': 'Get subscription by ID',
                'POST /api/subscriptions': 'Create new subscription',
                'PUT /api/subscriptions/:id': 'Update subscription',
                'DELETE /api/subscriptions/:id': 'Delete subscription',
                'POST /api/subscriptions/:id/status': 'Update subscription status',
                'POST /api/subscriptions/:id/activate': 'Activate subscription',
                'POST /api/subscriptions/:id/suspend': 'Suspend subscription',
                'POST /api/subscriptions/:id/terminate': 'Terminate subscription'
            },
            servicePackages: {
                'GET /api/service-packages': 'List all service packages',
                'GET /api/service-packages/stats': 'Get service package statistics',
                'GET /api/service-packages/:id': 'Get service package by ID',
                'POST /api/service-packages': 'Create new service package (Admin only)',
                'PUT /api/service-packages/:id': 'Update service package (Admin only)',
                'DELETE /api/service-packages/:id': 'Delete service package (Admin only)',
                'POST /api/service-packages/:id/activate': 'Activate service package',
                'POST /api/service-packages/:id/deactivate': 'Deactivate service package'
            },
            roles: {
                'GET /api/roles': 'List all roles (Admin only)',
                'GET /api/roles/stats': 'Get role statistics (Admin only)',
                'GET /api/roles/:id': 'Get role by ID (Admin only)',
                'POST /api/roles': 'Create new role (Admin only)',
                'PUT /api/roles/:id': 'Update role (Admin only)',
                'DELETE /api/roles/:id': 'Delete role (Admin only)',
                'POST /api/roles/:id/assign-permissions': 'Assign permissions to role (Admin only)',
                'DELETE /api/roles/:id/remove-permissions': 'Remove permissions from role (Admin only)',
                'GET /api/roles/:id/permissions': 'Get role permissions (Admin only)'
            },
            permissions: {
                'GET /api/permissions': 'List all permissions (Admin only)',
                'GET /api/permissions/resources': 'Get all unique resources (Admin only)',
                'GET /api/permissions/actions': 'Get all available actions (Admin only)',
                'GET /api/permissions/stats': 'Get permission statistics (Admin only)',
                'GET /api/permissions/by-resource/:resource': 'Get permissions by resource (Admin only)',
                'GET /api/permissions/:id': 'Get permission by ID (Admin only)',
                'POST /api/permissions': 'Create new permission (Admin only)',
                'PUT /api/permissions/:id': 'Update permission (Admin only)',
                'DELETE /api/permissions/:id': 'Delete permission (Admin only)'
            }
        },
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>',
            note: 'Include JWT token in Authorization header for protected routes'
        },
        permissions: {
            admin: 'Full system access',
            agent_noc: 'Ticket management and customer view',
            customer_service: 'Customer and ticket management'
        }
    });
});

module.exports = router;