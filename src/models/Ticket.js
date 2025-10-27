const BaseModel = require('./BaseModel');

class Ticket extends BaseModel {
    constructor() {
        super('tickets');
    }

    async generateTicketNumber() {
        const prefix = 'TKT';
        const year = new Date().getFullYear().toString().substr(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        
        // Get the latest ticket for today
        const sql = `
            SELECT ticket_number 
            FROM tickets 
            WHERE ticket_number LIKE ? 
            ORDER BY ticket_number DESC 
            LIMIT 1
        `;
        const pattern = `${prefix}${year}${month}${day}%`;
        const result = await this.db.query(sql, [pattern]);
        
        let sequence = 1;
        if (result.length > 0) {
            const lastNumber = result[0].ticket_number;
            const lastSequence = parseInt(lastNumber.substr(-3));
            sequence = lastSequence + 1;
        }
        
        return `${prefix}${year}${month}${day}${String(sequence).padStart(3, '0')}`;
    }

    async create(ticketData) {
        if (!ticketData.ticket_number) {
            ticketData.ticket_number = await this.generateTicketNumber();
        }
        
        const ticket = await super.create(ticketData);
        
        // Create initial status history
        await this.createStatusHistory(ticket.id, null, 'open', 'Ticket created', ticketData.created_by);
        
        return ticket;
    }

    async createStatusHistory(ticketId, previousStatus, newStatus, comment, changedBy) {
        const sql = `
            INSERT INTO ticket_status_histories 
            (ticket_id, previous_status, new_status, comment, changed_by) 
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.db.query(sql, [ticketId, previousStatus, newStatus, comment, changedBy]);
    }

    async updateStatus(ticketId, newStatus, comment, changedBy) {
        // Get current status
        const ticket = await this.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        
        const previousStatus = ticket.status;
        
        // Update ticket status
        const updateData = { status: newStatus };
        if (newStatus === 'resolved') {
            updateData.resolved_at = new Date();
        } else if (newStatus === 'closed') {
            updateData.closed_at = new Date();
        }
        
        await this.update(ticketId, updateData);
        
        // Create status history
        await this.createStatusHistory(ticketId, previousStatus, newStatus, comment, changedBy);
        
        return await this.findById(ticketId);
    }

    async getTicketWithDetails(ticketId) {
        const sql = `
            SELECT 
                t.*,
                c.full_name as customer_name,
                c.customer_code,
                c.phone as customer_phone,
                s.subscription_code,
                s.installation_address,
                sp.name as package_name,
                tc.name as category_name,
                creator.full_name as created_by_name,
                assignee.full_name as assigned_to_name
            FROM tickets t
            JOIN customers c ON t.customer_id = c.id
            JOIN subscriptions s ON t.subscription_id = s.id
            JOIN service_packages sp ON s.service_package_id = sp.id
            JOIN ticket_categories tc ON t.category_id = tc.id
            LEFT JOIN users creator ON t.created_by = creator.id
            LEFT JOIN users assignee ON t.assigned_to = assignee.id
            WHERE t.id = ?
        `;
        
        const results = await this.db.query(sql, [ticketId]);
        return results[0] || null;
    }

    async getTicketStatusHistory(ticketId) {
        const sql = `
            SELECT 
                tsh.*,
                u.full_name as changed_by_name
            FROM ticket_status_histories tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            WHERE tsh.ticket_id = ?
            ORDER BY tsh.changed_at ASC
        `;
        return await this.db.query(sql, [ticketId]);
    }

    async assignToUser(ticketId, userId) {
        // Update assigned_to in tickets table
        await this.update(ticketId, { assigned_to: userId });
        
        // Add to ticket_user pivot table
        const sql = `INSERT IGNORE INTO ticket_user (ticket_id, user_id) VALUES (?, ?)`;
        return await this.db.query(sql, [ticketId, userId]);
    }

    async getAssignedUsers(ticketId) {
        const sql = `
            SELECT u.*, tu.assigned_at
            FROM users u
            JOIN ticket_user tu ON u.id = tu.user_id
            WHERE tu.ticket_id = ?
            ORDER BY tu.assigned_at DESC
        `;
        return await this.db.query(sql, [ticketId]);
    }

    async getTicketsByStatus(status, limit = 10, offset = 0) {
        const limitNum = parseInt(limit) || 10;
        const offsetNum = parseInt(offset) || 0;
        const sql = `
            SELECT 
                t.*,
                c.full_name as customer_name,
                c.customer_code,
                tc.name as category_name
            FROM tickets t
            JOIN customers c ON t.customer_id = c.id
            JOIN ticket_categories tc ON t.category_id = tc.id
            WHERE t.status = ?
            ORDER BY t.created_at DESC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        return await this.db.query(sql, [status]);
    }

    async getTicketsByAssignedUser(userId, limit = 10, offset = 0) {
        const limitNum = parseInt(limit) || 10;
        const offsetNum = parseInt(offset) || 0;
        const sql = `
            SELECT 
                t.*,
                c.full_name as customer_name,
                c.customer_code,
                tc.name as category_name
            FROM tickets t
            JOIN customers c ON t.customer_id = c.id
            JOIN ticket_categories tc ON t.category_id = tc.id
            WHERE t.assigned_to = ?
            ORDER BY t.created_at DESC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        return await this.db.query(sql, [userId]);
    }

    async getTicketStats() {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM tickets
            GROUP BY status
        `;
        const results = await this.db.query(sql);
        
        const stats = {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
            cancelled: 0,
            total: 0
        };
        
        results.forEach(row => {
            stats[row.status] = row.count;
            stats.total += row.count;
        });
        
        return stats;
    }
}

module.exports = new Ticket();