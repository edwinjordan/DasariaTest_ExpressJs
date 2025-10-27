const BaseModel = require('./BaseModel');

class Role extends BaseModel {
    constructor() {
        super('roles');
    }

    async findByName(name) {
        return await this.findOneBy({ name });
    }

    async findWithPermissions(id) {
        const query = `
            SELECT r.*, 
               JSON_ARRAYAGG(
                   CASE WHEN p.id IS NOT NULL THEN
                   JSON_OBJECT(
                       'id', p.id,
                       'name', p.name,
                       'description', p.description
                   )
                   END
               ) as permissions
            FROM roles r
            LEFT JOIN permission_role pr ON r.id = pr.role_id
            LEFT JOIN permissions p ON pr.permission_id = p.id
            WHERE r.id = ?
            GROUP BY r.id
        `;

        const results = await this.db.query(query, [id]);
        if (results.length === 0) return null;

        const role = results[0];
        role.permissions = role.permissions ? role.permissions.filter(p => p !== null) : [];
        
        return role;
    }

    async assignPermissions(roleId, permissionIds) {
        // First, remove existing permissions
        await this.db.query('DELETE FROM permission_role WHERE role_id = ?', [roleId]);

        // Then add new permissions
        if (permissionIds.length > 0) {
            const values = permissionIds.map(permissionId => `(${permissionId}, ${roleId})`).join(',');
            const query = `INSERT INTO permission_role (permission_id, role_id) VALUES ${values}`;
            await this.db.query(query);
        }
    }

    async removePermissions(roleId, permissionIds) {
        if (permissionIds.length === 0) return;

        const placeholders = permissionIds.map(() => '?').join(',');
        const query = `DELETE FROM permission_role WHERE role_id = ? AND permission_id IN (${placeholders})`;
        await this.db.query(query, [roleId, ...permissionIds]);
    }

    async getPermissions(roleId) {
        const query = `
            SELECT p.*
            FROM permissions p
            INNER JOIN permission_role pr ON p.id = pr.permission_id
            WHERE pr.role_id = ?
            ORDER BY p.name
        `;
        return await this.db.query(query, [roleId]);
    }

    async getUsersCount(roleId) {
        const query = 'SELECT COUNT(*) as count FROM role_user WHERE role_id = ?';
        const results = await this.db.query(query, [roleId]);
        return results[0]?.count || 0;
    }

    async findAllWithStats(limit, offset, filters = {}) {
        let query = `
            SELECT r.*, 
                   COUNT(DISTINCT ur.user_id) as user_count,
                   COUNT(DISTINCT rp.permission_id) as permission_count
            FROM roles r
            LEFT JOIN role_user ur ON r.id = ur.role_id
            LEFT JOIN permission_role rp ON r.id = rp.role_id
        `;
        const params = [];

        if (filters.search) {
            query += ' WHERE (r.name LIKE ? OR r.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' GROUP BY r.id ORDER BY r.created_at DESC';

        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT r.id) as total
            FROM roles r
            ${filters.search ? 'WHERE (r.name LIKE ? OR r.description LIKE ?)' : ''}
        `;
        const countParams = filters.search ? [`%${filters.search}%`, `%${filters.search}%`] : [];
        
        query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const [roles, totalResult] = await Promise.all([
            this.db.query(query, params),
            this.db.query(countQuery, countParams)
        ]);

        return {
            roles,
            total: totalResult[0]?.total || 0
        };
    }

    async getStats() {
        const queries = [
            'SELECT COUNT(*) as total_roles FROM roles',
            `SELECT COUNT(*) as system_roles FROM roles WHERE name IN ('Admin', 'Agent NOC', 'Customer Service')`,
            `SELECT COUNT(*) as custom_roles FROM roles WHERE name NOT IN ('Admin', 'Agent NOC', 'Customer Service')`,
            `SELECT 
                r.name, 
                COUNT(DISTINCT ru.user_id) as user_count,
                COUNT(DISTINCT pr.permission_id) as permission_count
             FROM roles r
             LEFT JOIN role_user ru ON r.id = ru.role_id
             LEFT JOIN permission_role pr ON r.id = pr.role_id
             GROUP BY r.id, r.name
             ORDER BY user_count DESC`
        ];

        const [totalRoles, systemRoles, customRoles, roleDetails] = await Promise.all(
            queries.map(query => this.db.query(query))
        );

        return {
            total_roles: totalRoles[0]?.total_roles || 0,
            system_roles: systemRoles[0]?.system_roles || 0,
            custom_roles: customRoles[0]?.custom_roles || 0,
            role_details: roleDetails
        };
    }
}

module.exports = new Role();