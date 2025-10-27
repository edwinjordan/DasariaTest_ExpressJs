const BaseRepository = require('./BaseRepository');
const ServicePackage = require('../models/ServicePackage');

class ServicePackageRepository extends BaseRepository {
    constructor() {
        super(ServicePackage);
    }

    async getActivePackages() {
        return await this.model.getActivePackages();
    }

    async getPackageWithSubscriptionCount(packageId) {
        return await this.model.getPackageWithSubscriptionCount(packageId);
    }

    async getAllPackagesWithStats() {
        return await this.model.getAllPackagesWithStats();
    }

    async createPackage(packageData) {
        // Validate unique package name
        const existingPackage = await this.findBy({ name: packageData.name });
        if (existingPackage && existingPackage.length > 0) {
            throw new Error('Service package name already exists');
        }

        return await this.model.create(packageData);
    }

    async updatePackage(id, packageData) {
        // Check if package exists
        const exists = await this.model.findById(id);
        if (!exists) {
            throw new Error(`Service package with id ${id} not found`);
        }

        // Validate unique package name if name is being updated
        if (packageData.name) {
            const existingPackage = await this.findBy({ name: packageData.name });
            if (existingPackage && existingPackage.length > 0 && existingPackage[0].id !== parseInt(id)) {
                throw new Error('Service package name already exists');
            }
        }

        return await this.model.update(id, packageData);
    }

    async deletePackage(id) {
        // Check if package has active subscriptions
        const packageWithStats = await this.getPackageWithSubscriptionCount(id);
        if (packageWithStats && packageWithStats.subscription_count > 0) {
            throw new Error('Cannot delete service package with existing subscriptions');
        }

        return await this.model.delete(id);
    }

    async getPackagesBySpeedRange(minSpeed, maxSpeed) {
        const sql = `
            SELECT * FROM service_packages 
            WHERE speed_mbps >= ? AND speed_mbps <= ? AND is_active = true
            ORDER BY speed_mbps ASC
        `;
        return await this.model.db.query(sql, [minSpeed, maxSpeed]);
    }

    async getPackagesByPriceRange(minPrice, maxPrice) {
        const sql = `
            SELECT * FROM service_packages 
            WHERE price >= ? AND price <= ? AND is_active = true
            ORDER BY price ASC
        `;
        return await this.model.db.query(sql, [minPrice, maxPrice]);
    }

    async getPopularPackages(limit = 5) {
        const sql = `
            SELECT 
                sp.*,
                COUNT(s.id) as subscription_count
            FROM service_packages sp
            LEFT JOIN subscriptions s ON sp.id = s.service_package_id
            WHERE sp.is_active = true
            GROUP BY sp.id
            ORDER BY subscription_count DESC
            LIMIT ${parseInt(limit)}
        `;
        return await this.model.db.query(sql);
    }

    async searchPackages(searchTerm) {
        const sql = `
            SELECT 
                sp.*,
                COUNT(s.id) as subscription_count
            FROM service_packages sp
            LEFT JOIN subscriptions s ON sp.id = s.service_package_id
            WHERE 
                sp.name LIKE ? OR 
                sp.description LIKE ?
            GROUP BY sp.id
            ORDER BY sp.name ASC
        `;
        const searchPattern = `%${searchTerm}%`;
        return await this.model.db.query(sql, [searchPattern, searchPattern]);
    }

    async searchPackages(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const data = await this.model.searchPackages(searchTerm, limit, offset);

        // Get total count for pagination
        const countSql = `
            SELECT COUNT(*) as total FROM service_packages 
            WHERE 
                name LIKE ? OR 
                description LIKE ? OR 
                speed_mbps LIKE ? OR
                price LIKE ?
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
}

module.exports = new ServicePackageRepository();