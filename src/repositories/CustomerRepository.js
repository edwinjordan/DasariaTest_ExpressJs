const BaseRepository = require('./BaseRepository');
const Customer = require('../models/Customer');

class CustomerRepository extends BaseRepository {
    constructor() {
        super(Customer);
    }

    async findByCustomerCode(customerCode) {
        return await this.model.findByCustomerCode(customerCode);
    }

    async createCustomer(customerData) {
        return await this.model.create(customerData);
    }

    async getCustomerWithSubscriptions(customerId) {
        return await this.model.getCustomerWithSubscriptions(customerId);
    }

    async searchCustomers(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await this.model.searchCustomers(searchTerm, limit, offset);
        
        // Get total count for pagination
        const countSql = `
            SELECT COUNT(*) as total FROM customers 
            WHERE 
                customer_code LIKE ? OR 
                full_name LIKE ? OR 
                email LIKE ? OR 
                phone LIKE ?
        `;
        const searchPattern = `%${searchTerm}%`;
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

    async getActiveCustomers() {
        return await this.findBy({ is_active: true });
    }

    async getActiveCustomersCount() {
        return await this.model.getActiveCustomersCount();
    }

    async getCustomerStats() {
        const total = await this.count();
        const active = await this.count({ is_active: true });
        const inactive = total - active;

        return {
            total,
            active,
            inactive
        };
    }

    async deactivateCustomer(customerId) {
        return await this.update(customerId, { is_active: false });
    }

    async activateCustomer(customerId) {
        return await this.update(customerId, { is_active: true });
    }
}

module.exports = new CustomerRepository();