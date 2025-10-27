const BaseModel = require('./BaseModel');

class Subscription extends BaseModel {
    constructor() {
        super('subscriptions');
    }

    async generateSubscriptionCode() {
        const prefix = 'SUB';
        const year = new Date().getFullYear().toString().substr(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        
        // Get the latest subscription for this month
        const sql = `
            SELECT subscription_code 
            FROM subscriptions 
            WHERE subscription_code LIKE ? 
            ORDER BY subscription_code DESC 
            LIMIT 1
        `;
        const pattern = `${prefix}${year}${month}%`;
        const result = await this.db.query(sql, [pattern]);
        
        let sequence = 1;
        if (result.length > 0) {
            const lastCode = result[0].subscription_code;
            const lastSequence = parseInt(lastCode.substr(-4));
            sequence = lastSequence + 1;
        }
        
        return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
    }

    async create(subscriptionData) {
        if (!subscriptionData.subscription_code) {
            subscriptionData.subscription_code = await this.generateSubscriptionCode();
        }
        return await super.create(subscriptionData);
    }

    async getSubscriptionWithDetails(subscriptionId) {
        const sql = `
            SELECT 
                s.*,
                c.full_name as customer_name,
                c.customer_code,
                c.phone as customer_phone,
                c.email as customer_email,
                sp.name as package_name,
                sp.description as package_description,
                sp.speed_mbps,
                sp.price as package_price
            FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE s.id = ?
        `;
        
        const results = await this.db.query(sql, [subscriptionId]);
        return results[0] || null;
    }

    async getSubscriptionsByCustomer(customerId) {
        const sql = `
            SELECT 
                s.*,
                sp.name as package_name,
                sp.speed_mbps,
                sp.price as package_price
            FROM subscriptions s
            JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE s.customer_id = ?
            ORDER BY s.created_at DESC
        `;
        return await this.db.query(sql, [customerId]);
    }

    async getActiveSubscriptions() {
        return await this.findBy({ status: 'active' });
    }

    async updateStatus(subscriptionId, status) {
        return await this.update(subscriptionId, { status });
    }

    async getSubscriptionStats() {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM subscriptions
            GROUP BY status
        `;
        const results = await this.db.query(sql);
        
        const stats = {
            pending: 0,
            active: 0,
            suspended: 0,
            terminated: 0,
            total: 0
        };
        
        results.forEach(row => {
            stats[row.status] = row.count;
            stats.total += row.count;
        });
        
        return stats;
    }
}

module.exports = new Subscription();