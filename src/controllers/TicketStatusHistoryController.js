const { param, query } = require('express-validator');
const TicketStatusHistoryRepository = require('../repositories/TicketStatusHistoryRepository');
const TicketRepository = require('../repositories/TicketRepository');

class TicketStatusHistoryController {
    static validateTicketId = [
        param('ticketId').isInt({ min: 1 }).withMessage('Valid ticket ID is required')
    ];

    static validateLimit = [
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ];

    // GET /ticket-status-histories/ticket/:ticketId - Get history by ticket ID
    static async getByTicket(req, res, next) {
        try {
            const { ticketId } = req.params;

            // Verify ticket exists
            const ticket = await TicketRepository.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            const histories = await TicketStatusHistoryRepository.getHistoryWithTicketInfo(ticketId);

            res.json({
                success: true,
                message: 'Ticket status history retrieved successfully',
                data: {
                    ticket_id: parseInt(ticketId),
                    ticket_number: histories[0]?.ticket_number || ticket.ticket_number,
                    histories: histories
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-status-histories/recent - Get recent status changes
    static async getRecent(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const histories = await TicketStatusHistoryRepository.getRecentHistories(limit);

            res.json({
                success: true,
                message: 'Recent status changes retrieved successfully',
                data: histories
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-status-histories/stats - Get history statistics
    static async getStats(req, res, next) {
        try {
            const stats = await TicketStatusHistoryRepository.getHistoryStats();
            const avgResolutionTime = await TicketStatusHistoryRepository.getAverageResolutionTime();

            res.json({
                success: true,
                message: 'Status history statistics retrieved successfully',
                data: {
                    ...stats,
                    average_resolution_time_hours: parseFloat(avgResolutionTime).toFixed(2)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-status-histories/:id - Get specific history entry
    static async show(req, res, next) {
        try {
            const { id } = req.params;
            const history = await TicketStatusHistoryRepository.findById(id);

            if (!history) {
                return res.status(404).json({
                    success: false,
                    message: 'Status history not found'
                });
            }

            res.json({
                success: true,
                message: 'Status history retrieved successfully',
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /ticket-status-histories - Get all histories with pagination
    static async index(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await TicketStatusHistoryRepository.paginate(
                page, 
                limit, 
                {}, 
                'changed_at DESC'
            );

            res.json({
                success: true,
                message: 'Status histories retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TicketStatusHistoryController;
