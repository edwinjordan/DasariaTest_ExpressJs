const BaseModel = require('./BaseModel');

class Permission extends BaseModel {
    constructor() {
        super('permissions');
    }

    async findByName(name) {
        return await this.findOneBy({ name });
    }

    async findByResource(resource) {
        return await this.findBy({ resource }, 'action, name');
    }

    async getUniqueResources() {
        const query = 'SELECT DISTINCT resource FROM permissions ORDER BY resource';
        const results = await this.db.query(query);
        return results.map(row => row.resource);
    }

    async getRolesCount(permissionId) {
        const query = 'SELECT COUNT(*) as count FROM permission_role WHERE permission_id = ?';
        const results = await this.db.query(query, [permissionId]);
        return results[0]?.count || 0;
    }

    async findAllWithStats(limit, offset, filters = {}) {
        let query = `
            SELECT p.*, 
                   COUNT(DISTINCT pr.role_id) as role_count
            FROM permissions p
            LEFT JOIN permission_role pr ON p.id = pr.permission_id
        `;
        const params = [];
        const conditions = [];

        if (filters.search) {
            conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY p.id ORDER BY p.name';

        // Get total count
        let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM permissions p';
        const countParams = [];

        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
            // Add the same parameters for count query (excluding the LIKE parameters duplication)
            if (filters.resource) countParams.push(filters.resource);
            if (filters.action) countParams.push(filters.action);
            if (filters.search) countParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const [permissions, totalResult] = await Promise.all([
            this.db.query(query, params),
            this.db.query(countQuery, countParams)
        ]);

        return {
            permissions,
            total: totalResult[0]?.total || 0
        };
    }

    async getStats() {
        const queries = [
            'SELECT COUNT(*) as total_permissions FROM permissions',
            'SELECT COUNT(DISTINCT resource) as total_resources FROM permissions',
            'SELECT COUNT(DISTINCT action) as total_actions FROM permissions',
            `SELECT 
                resource, 
                COUNT(*) as permission_count,
                COUNT(DISTINCT pr.role_id) as assigned_to_roles
             FROM permissions p
             LEFT JOIN permission_role pr ON p.id = pr.permission_id
             GROUP BY resource
             ORDER BY permission_count DESC`,
            `SELECT 
                action, 
                COUNT(*) as permission_count,
                COUNT(DISTINCT pr.role_id) as assigned_to_roles
             FROM permissions p
             LEFT JOIN permission_role pr ON p.id = pr.permission_id
             GROUP BY action
             ORDER BY permission_count DESC`
        ];

        const [totalPermissions, totalResources, totalActions, resourceStats, actionStats] = await Promise.all(
            queries.map(query => this.db.query(query))
        );

        return {
            total_permissions: totalPermissions[0]?.total_permissions || 0,
            total_resources: totalResources[0]?.total_resources || 0,
            total_actions: totalActions[0]?.total_actions || 0,
            by_resource: resourceStats,
            by_action: actionStats
        };
    }
}

module.exports = new Permission();