const BaseModel = require('./BaseModel');

class TicketStatusHistory extends BaseModel {
    constructor() {
        super('ticket_status_histories');
    }

    async getHistoryByTicketId(ticketId) {
        const sql = `
            SELECT 
                tsh.*,
                u.full_name as changed_by_name,
                u.email as changed_by_email
            FROM ticket_status_histories tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            WHERE tsh.ticket_id = ?
            ORDER BY tsh.changed_at DESC
        `;
        return await this.db.query(sql, [ticketId]);
    }

    async getHistoryWithTicketInfo(ticketId) {
        const sql = `
            SELECT 
                tsh.*,
                u.full_name as changed_by_name,
                t.ticket_number,
                t.title as ticket_title,
                c.full_name as customer_name
            FROM ticket_status_histories tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            LEFT JOIN tickets t ON tsh.ticket_id = t.id
            LEFT JOIN customers c ON t.customer_id = c.id
            WHERE tsh.ticket_id = ?
            ORDER BY tsh.changed_at DESC
        `;
        return await this.db.query(sql, [ticketId]);
    }

    async getRecentHistories(limit = 50) {
        const sql = `
            SELECT 
                tsh.*,
                u.full_name as changed_by_name,
                t.ticket_number,
                t.title as ticket_title,
                c.full_name as customer_name
            FROM ticket_status_histories tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            LEFT JOIN tickets t ON tsh.ticket_id = t.id
            LEFT JOIN customers c ON t.customer_id = c.id
            ORDER BY tsh.changed_at DESC
            LIMIT ${parseInt(limit)}
        `;
        return await this.db.query(sql);
    }

    async getHistoryStats() {
        const queries = [
            `SELECT COUNT(*) as total_changes FROM ticket_status_histories`,
            `SELECT 
                new_status, 
                COUNT(*) as count 
             FROM ticket_status_histories 
             GROUP BY new_status 
             ORDER BY count DESC`,
            `SELECT 
                DATE(changed_at) as date,
                COUNT(*) as changes_count
             FROM ticket_status_histories
             WHERE changed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(changed_at)
             ORDER BY date DESC`,
            `SELECT 
                u.full_name as user_name,
                COUNT(*) as changes_count
             FROM ticket_status_histories tsh
             LEFT JOIN users u ON tsh.changed_by = u.id
             WHERE tsh.changed_by IS NOT NULL
             GROUP BY tsh.changed_by, u.full_name
             ORDER BY changes_count DESC
             LIMIT 10`
        ];

        const [totalChanges, byStatus, dailyChanges, byUser] = await Promise.all(
            queries.map(query => this.db.query(query))
        );

        return {
            total_changes: totalChanges[0]?.total_changes || 0,
            by_status: byStatus,
            daily_changes_last_30_days: dailyChanges,
            most_active_users: byUser
        };
    }

    async getAverageResolutionTime() {
        const sql = `
            SELECT 
                AVG(TIMESTAMPDIFF(HOUR, created.changed_at, resolved.changed_at)) as avg_hours
            FROM ticket_status_histories created
            JOIN ticket_status_histories resolved 
                ON created.ticket_id = resolved.ticket_id
            WHERE created.new_status = 'open'
                AND resolved.new_status = 'resolved'
                AND created.id < resolved.id
        `;
        const result = await this.db.query(sql);
        return result[0]?.avg_hours || 0;
    }
}

module.exports = new TicketStatusHistory();
