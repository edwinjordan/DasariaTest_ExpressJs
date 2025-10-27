const BaseModel = require('./BaseModel');

class Customer extends BaseModel {
    constructor() {
        super('customers');
    }

    async findByCustomerCode(customerCode) {
        return await this.findOneBy({ customer_code: customerCode });
    }

    async generateCustomerCode() {
        const prefix = 'CUST';
        const year = new Date().getFullYear().toString().substr(-2);
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        
        // Get the latest customer for this month
        const sql = `
            SELECT customer_code 
            FROM customers 
            WHERE customer_code LIKE ? 
            ORDER BY customer_code DESC 
            LIMIT 1
        `;
        const pattern = `${prefix}${year}${month}%`;
        const result = await this.db.query(sql, [pattern]);
        
        let sequence = 1;
        if (result.length > 0) {
            const lastCode = result[0].customer_code;
            const lastSequence = parseInt(lastCode.substr(-4));
            sequence = lastSequence + 1;
        }
        
        return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
    }

    async create(customerData) {
        if (!customerData.customer_code) {
            customerData.customer_code = await this.generateCustomerCode();
        }
        return await super.create(customerData);
    }

    async getCustomerWithSubscriptions(customerId) {
        const sql = `
            SELECT 
                c.*,
                s.id as subscription_id,
                s.subscription_code,
                s.installation_address,
                s.status as subscription_status,
                s.monthly_fee,
                sp.name as package_name,
                sp.speed_mbps
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id
            LEFT JOIN service_packages sp ON s.service_package_id = sp.id
            WHERE c.id = ?
            ORDER BY s.created_at DESC
        `;
        
        const results = await this.db.query(sql, [customerId]);
        
        if (results.length === 0) {
            return null;
        }
        
        const customer = {
            id: results[0].id,
            customer_code: results[0].customer_code,
            full_name: results[0].full_name,
            email: results[0].email,
            phone: results[0].phone,
            address: results[0].address,
            id_number: results[0].id_number,
            is_active: results[0].is_active,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at,
            subscriptions: []
        };
        
        // Group subscriptions
        results.forEach(row => {
            if (row.subscription_id) {
                customer.subscriptions.push({
                    id: row.subscription_id,
                    subscription_code: row.subscription_code,
                    installation_address: row.installation_address,
                    status: row.subscription_status,
                    monthly_fee: row.monthly_fee,
                    package_name: row.package_name,
                    speed_mbps: row.speed_mbps
                });
            }
        });
        
        return customer;
    }

    async searchCustomers(searchTerm, limit = 10, offset = 0) {
        const limitNum = parseInt(limit) || 10;
        const offsetNum = parseInt(offset) || 0;
        const sql = `
            SELECT * FROM customers 
            WHERE 
                customer_code LIKE ? OR 
                full_name LIKE ? OR 
                email LIKE ? OR 
                phone LIKE ?
            ORDER BY full_name ASC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        const searchPattern = `%${searchTerm}%`;
        return await this.db.query(sql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);
    }

    async getActiveCustomersCount() {
        return await this.count({ is_active: true });
    }
}

module.exports = new Customer();