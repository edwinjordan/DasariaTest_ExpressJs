const BaseModel = require('./BaseModel');

class ServicePackage extends BaseModel {
    constructor() {
        super('service_packages');
    }

    async getActivePackages() {
        return await this.findBy({ is_active: true });
    }

    async getPackageWithSubscriptionCount(packageId) {
        const sql = `
            SELECT 
                sp.*,
                COUNT(s.id) as subscription_count
            FROM service_packages sp
            LEFT JOIN subscriptions s ON sp.id = s.service_package_id
            WHERE sp.id = ?
            GROUP BY sp.id
        `;
        
        const results = await this.db.query(sql, [packageId]);
        return results[0] || null;
    }

    async getAllPackagesWithStats() {
        const sql = `
            SELECT 
                sp.*,
                COUNT(s.id) as subscription_count,
                COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions
            FROM service_packages sp
            LEFT JOIN subscriptions s ON sp.id = s.service_package_id
            GROUP BY sp.id
            ORDER BY sp.speed_mbps ASC
        `;
        return await this.db.query(sql);
    }

    async searchPackages(searchTerm, limit = 10, offset = 0) {
        const limitNum = parseInt(limit) || 10;
        const offsetNum = parseInt(offset) || 0;
        const sql = `
            SELECT * FROM service_packages
            WHERE 
                name LIKE ? OR 
                description LIKE ? OR 
                speed_mbps LIKE ? OR
                price LIKE ?
            ORDER BY name ASC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        const searchPattern = `%${searchTerm}%`;
        return await this.db.query(sql, [
            searchPattern, searchPattern, searchPattern, searchPattern
        ]);
    }
}

module.exports = new ServicePackage();