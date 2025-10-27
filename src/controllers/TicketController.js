const { body, param } = require('express-validator');
const TicketRepository = require('../repositories/TicketRepository');

class TicketController {
    static validateCreate = [
        body('customer_id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
        body('subscription_id').isInt({ min: 1 }).withMessage('Invalid subscription ID'),
        body('category_id').isInt({ min: 1 }).withMessage('Invalid category ID'),
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
    ];

    static validateUpdate = [
        param('id').isInt({ min: 1 }).withMessage('Invalid ticket ID'),
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('description').optional().notEmpty().withMessage('Description cannot be empty'),
        body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
        body('assigned_to').optional().isInt({ min: 1 }).withMessage('Invalid assigned user ID')
    ];

    static validateUpdateStatus = [
        param('id').isInt({ min: 1 }).withMessage('Invalid ticket ID'),
        body('status').isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled']).withMessage('Invalid status'),
        body('comment').optional().isString().withMessage('Comment must be a string')
    ];

    static validateAssign = [
        param('id').isInt({ min: 1 }).withMessage('Invalid ticket ID'),
        body('user_id').isInt({ min: 1 }).withMessage('Invalid user ID')
    ];

    static validateId = [
        param('id').isInt({ min: 1 }).withMessage('Invalid ticket ID')
    ];

    static async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const priority = req.query.priority;
            const assignedTo = req.query.assigned_to;

            let result;

            if (search) {
                result = await TicketRepository.searchTickets(search, page, limit);
            } else if (status) {
                result = await TicketRepository.getTicketsByStatus(status, page, limit);
            } else if (priority) {
                result = await TicketRepository.getTicketsByPriority(priority, page, limit);
            } else if (assignedTo) {
                result = await TicketRepository.getTicketsByAssignedUser(assignedTo, page, limit);
            } else {
                result = await TicketRepository.paginate(page, limit, {}, 'created_at DESC');
            }

            res.json({
                success: true,
                message: 'Tickets retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const ticketId = req.params.id;
            const ticket = await TicketRepository.getTicketWithDetails(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            // Get status history
            const statusHistory = await TicketRepository.getTicketStatusHistory(ticketId);
            
            // Get assigned users
            const assignedUsers = await TicketRepository.getAssignedUsers(ticketId);

            res.json({
                success: true,
                message: 'Ticket retrieved successfully',
                data: {
                    ...ticket,
                    status_history: statusHistory,
                    assigned_users: assignedUsers
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const ticketData = {
                ...req.body,
                created_by: req.user.id
            };

            const ticket = await TicketRepository.createTicket(ticketData);

            res.status(201).json({
                success: true,
                message: 'Ticket created successfully',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const ticketId = req.params.id;
            const updateData = req.body;

            const ticket = await TicketRepository.update(ticketId, updateData);

            res.json({
                success: true,
                message: 'Ticket updated successfully',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req, res, next) {
        try {
            const ticketId = req.params.id;
            const { status, comment } = req.body;

            const ticket = await TicketRepository.updateStatus(
                ticketId, 
                status, 
                comment || `Status changed to ${status}`, 
                req.user.id
            );

            res.json({
                success: true,
                message: 'Ticket status updated successfully',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    }

    static async assign(req, res, next) {
        try {
            const ticketId = req.params.id;
            const { user_id } = req.body;

            await TicketRepository.assignToUser(ticketId, user_id);

            res.json({
                success: true,
                message: 'Ticket assigned successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async myTickets(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.user.id;

            const result = await TicketRepository.getTicketsByAssignedUser(userId, page, limit);

            res.json({
                success: true,
                message: 'My tickets retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async stats(req, res, next) {
        try {
            const stats = await TicketRepository.getTicketStats();

            res.json({
                success: true,
                message: 'Ticket statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    static async open(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await TicketRepository.getOpenTickets(page, limit);

            res.json({
                success: true,
                message: 'Open tickets retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async inProgress(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await TicketRepository.getInProgressTickets(page, limit);

            res.json({
                success: true,
                message: 'In progress tickets retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const ticketId = req.params.id;
            await TicketRepository.delete(ticketId);

            res.json({
                success: true,
                message: 'Ticket deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TicketController;