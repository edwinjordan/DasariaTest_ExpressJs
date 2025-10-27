const BaseModel = require('./BaseModel');

class TicketCategory extends BaseModel {
    constructor() {
        super('ticket_categories');
    }

    async searchCategories(searchTerm, limit = 10, offset = 0) {
        const limitNum = parseInt(limit) || 10;
        const offsetNum = parseInt(offset) || 0;
        const sql = `
            SELECT * FROM ticket_categories
            WHERE 
                name LIKE ? OR 
                description LIKE ? OR 
                priority_level LIKE ?
            ORDER BY name ASC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        const searchPattern = `%${searchTerm}%`;
        return await this.db.query(sql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);
    }

    async getCategoryWithTicketCount(categoryId) {
        const sql = `
            SELECT 
                tc.*,
                COUNT(t.id) as ticket_count,
                COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tickets
            FROM ticket_categories tc
            LEFT JOIN tickets t ON tc.id = t.category_id
            WHERE tc.id = ?
            GROUP BY tc.id
        `;
        
        const results = await this.db.query(sql, [categoryId]);
        return results[0] || null;
    }

    async getAllCategoriesWithStats() {
        const sql = `
            SELECT 
                tc.*,
                COUNT(t.id) as ticket_count,
                COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tickets,
                COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets
            FROM ticket_categories tc
            LEFT JOIN tickets t ON tc.id = t.category_id
            GROUP BY tc.id
            ORDER BY tc.priority_level DESC, tc.name ASC
        `;
        return await this.db.query(sql);
    }
}

module.exports = new TicketCategory();