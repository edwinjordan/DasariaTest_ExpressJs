const BaseRepository = require('./BaseRepository');
const Subscription = require('../models/Subscription');

class SubscriptionRepository extends BaseRepository {
    constructor() {
        super(Subscription);
    }

    async createSubscription(subscriptionData) {
        return await this.model.create(subscriptionData);
    }

    async getSubscriptionWithDetails(subscriptionId) {
        return await this.model.getSubscriptionWithDetails(subscriptionId);
    }

    async getSubscriptionsByCustomer(customerId) {
        return await this.model.getSubscriptionsByCustomer(customerId);
    }

    async getActiveSubscriptions() {
        return await this.model.getActiveSubscriptions();
    }

    async updateStatus(subscriptionId, status) {
        return await this.model.updateStatus(subscriptionId, status);
    }

    async getSubscriptionStats() {
        return await this.model.getSubscriptionStats();
    }

    async getSubscriptionsByStatus(status, page = 1, limit = 10) {
        return await this.paginate(page, limit, { status });
    }

    async getSubscriptionsByPackage(packageId, page = 1, limit = 10) {
        return await this.paginate(page, limit, { service_package_id: packageId });
    }

    async searchSubscriptions(searchTerm, page = 1, limit = 10) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        
        const sql = `
            SELECT 
                s.*,
                c.full_name as customer_name,
                c.customer_code,
                sp.name as package_name
            FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE 
                s.subscription_code LIKE ? OR 
                c.full_name LIKE ? OR 
                c.customer_code LIKE ? OR
                sp.name LIKE ?
            ORDER BY s.created_at DESC
            LIMIT ${limitNum} OFFSET ${offset}
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const data = await this.model.db.query(sql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE 
                s.subscription_code LIKE ? OR 
                c.full_name LIKE ? OR 
                c.customer_code LIKE ? OR
                sp.name LIKE ?
        `;
        const countResult = await this.model.db.query(countSql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data,
            pagination: {
                current_page: pageNum,
                per_page: limitNum,
                total,
                total_pages: totalPages,
                has_next: pageNum < totalPages,
                has_prev: pageNum > 1
            }
        };
    }

    async getSubscriptionsByDateRange(startDate, endDate, page = 1, limit = 10) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        
        const sql = `
            SELECT 
                s.*,
                c.full_name as customer_name,
                c.customer_code,
                sp.name as package_name
            FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE s.created_at >= ? AND s.created_at <= ?
            ORDER BY s.created_at DESC
            LIMIT ${limitNum} OFFSET ${offset}
        `;
        
        const data = await this.model.db.query(sql, [startDate, endDate]);

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total FROM subscriptions s
            WHERE s.created_at >= ? AND s.created_at <= ?
        `;
        const countResult = await this.model.db.query(countSql, [startDate, endDate]);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data,
            pagination: {
                current_page: pageNum,
                per_page: limitNum,
                total,
                total_pages: totalPages,
                has_next: pageNum < totalPages,
                has_prev: pageNum > 1
            }
        };
    }

    async getRevenueByMonth(year) {
        const sql = `
            SELECT 
                MONTH(created_at) as month,
                COUNT(*) as subscription_count,
                SUM(monthly_fee) as total_revenue
            FROM subscriptions 
            WHERE YEAR(created_at) = ? AND status = 'active'
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
        `;
        return await this.model.db.query(sql, [year]);
    }

    async getTopCustomersByRevenue(limit = 10) {
        const sql = `
            SELECT 
                c.id,
                c.customer_code,
                c.full_name,
                COUNT(s.id) as subscription_count,
                SUM(s.monthly_fee) as total_monthly_revenue
            FROM customers c
            JOIN subscriptions s ON c.id = s.customer_id
            WHERE s.status = 'active'
            GROUP BY c.id, c.customer_code, c.full_name
            ORDER BY total_monthly_revenue DESC
            LIMIT ${parseInt(limit)}
        `;
        return await this.model.db.query(sql);
    }

    async getSubscriptionGrowth(months = 12) {
        const sql = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as new_subscriptions,
                SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as cumulative_subscriptions
            FROM subscriptions 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month
        `;
        return await this.model.db.query(sql, [months]);
    }
}

module.exports = new SubscriptionRepository();