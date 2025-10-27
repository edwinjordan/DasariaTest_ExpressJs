const BaseRepository = require('./BaseRepository');
const TicketCategory = require('../models/TicketCategory');

class TicketCategoryRepository extends BaseRepository {
    constructor() {
        super(TicketCategory);
    }

    async searchCategories(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await this.model.searchCategories(searchTerm, limit, offset);
        
        // Get total count for pagination
        const countSql = `
            SELECT COUNT(*) as total FROM ticket_categories 
            WHERE 
                name LIKE ? OR 
                description LIKE ? OR 
                priority_level LIKE ?
        `;
        const searchPattern = `%${searchTerm}%`;
        const countResult = await this.model.db.query(countSql, [
            searchPattern, searchPattern, searchPattern
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

    async findByName(name) {
        return await this.model.findOneBy({ name });
    }

    async getCategoryWithStats(categoryId) {
        return await this.model.getCategoryWithTicketCount(categoryId);
    }

    async getAllWithStats() {
        return await this.model.getAllCategoriesWithStats();
    }

    async hasTickets(categoryId) {
        const category = await this.getCategoryWithStats(categoryId);
        return category && parseInt(category.ticket_count) > 0;
    }
}

module.exports = new TicketCategoryRepository();
