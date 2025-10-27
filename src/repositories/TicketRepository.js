const BaseRepository = require('./BaseRepository');
const Ticket = require('../models/Ticket');

class TicketRepository extends BaseRepository {
    constructor() {
        super(Ticket);
    }

    async createTicket(ticketData) {
        return await this.model.create(ticketData);
    }

    async updateStatus(ticketId, newStatus, comment, changedBy) {
        return await this.model.updateStatus(ticketId, newStatus, comment, changedBy);
    }

    async getTicketWithDetails(ticketId) {
        return await this.model.getTicketWithDetails(ticketId);
    }

    async getTicketStatusHistory(ticketId) {
        return await this.model.getTicketStatusHistory(ticketId);
    }

    async assignToUser(ticketId, userId) {
        return await this.model.assignToUser(ticketId, userId);
    }

    async getAssignedUsers(ticketId) {
        return await this.model.getAssignedUsers(ticketId);
    }

    async getTicketsByStatus(status, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await this.model.getTicketsByStatus(status, limit, offset);
        
        const total = await this.count({ status });
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                current_page: page,
                per_page: limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    }

    async getTicketsByAssignedUser(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await this.model.getTicketsByAssignedUser(userId, limit, offset);
        
        const total = await this.count({ assigned_to: userId });
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                current_page: page,
                per_page: limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    }

    async getTicketStats() {
        return await this.model.getTicketStats();
    }

    async searchTickets(searchTerm, page = 1, limit = 10) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const sql = `
            SELECT 
                t.*,
                c.full_name as customer_name,
                c.customer_code,
                tc.name as category_name
            FROM tickets t
            JOIN customers c ON t.customer_id = c.id
            JOIN ticket_categories tc ON t.category_id = tc.id
            WHERE 
                t.ticket_number LIKE ? OR 
                t.title LIKE ? OR 
                c.full_name LIKE ? OR 
                c.customer_code LIKE ?
            ORDER BY t.created_at DESC
            LIMIT ${limitNum} OFFSET ${offset}
        `;
        const searchPattern = `%${searchTerm}%`;
        const data = await this.model.db.query(sql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total FROM tickets t
            JOIN customers c ON t.customer_id = c.id
            WHERE 
                t.ticket_number LIKE ? OR 
                t.title LIKE ? OR 
                c.full_name LIKE ? OR 
                c.customer_code LIKE ?
        `;
        const countResult = await this.model.db.query(countSql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                current_page: page,
                per_page: limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    }

    async getTicketsByPriority(priority, page = 1, limit = 10) {
        return await this.paginate(page, limit, { priority });
    }

    async getOpenTickets(page = 1, limit = 10) {
        return await this.getTicketsByStatus('open', page, limit);
    }

    async getInProgressTickets(page = 1, limit = 10) {
        return await this.getTicketsByStatus('in_progress', page, limit);
    }
}

module.exports = new TicketRepository();