const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
    constructor() {
        super('users');
    }

    async findByEmail(email) {
        return await this.findOneBy({ email });
    }

    async findByUsername(username) {
        return await this.findOneBy({ username });
    }

    async create(userData) {
        // Hash password before storing
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        
        return await super.create(userData);
    }

    async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await this.update(id, { password: hashedPassword });
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async getUserWithRoles(userId) {
        const sql = `
            SELECT 
                u.*,
                GROUP_CONCAT(r.name) as roles,
                GROUP_CONCAT(DISTINCT p.name) as permissions
            FROM users u
            LEFT JOIN role_user ru ON u.id = ru.user_id
            LEFT JOIN roles r ON ru.role_id = r.id
            LEFT JOIN permission_role pr ON r.id = pr.role_id
            LEFT JOIN permissions p ON pr.permission_id = p.id
            WHERE u.id = ?
            GROUP BY u.id
        `;
        
        const results = await this.db.query(sql, [userId]);
        const user = results[0];
        
        if (user) {
            user.roles = user.roles ? user.roles.split(',') : [];
            user.permissions = user.permissions ? user.permissions.split(',') : [];
        }
        
        return user;
    }

    async assignRole(userId, roleId) {
        const sql = `INSERT IGNORE INTO role_user (user_id, role_id) VALUES (?, ?)`;
        return await this.db.query(sql, [userId, roleId]);
    }

    async removeRole(userId, roleId) {
        const sql = `DELETE FROM role_user WHERE user_id = ? AND role_id = ?`;
        return await this.db.query(sql, [userId, roleId]);
    }

    async getUserRoles(userId) {
        const sql = `
            SELECT r.* 
            FROM roles r
            JOIN role_user ru ON r.id = ru.role_id
            WHERE ru.user_id = ?
        `;
        return await this.db.query(sql, [userId]);
    }

    async getUserPermissions(userId) {
        const sql = `
            SELECT DISTINCT p.*
            FROM permissions p
            JOIN permission_role pr ON p.id = pr.permission_id
            JOIN role_user ru ON pr.role_id = ru.role_id
            WHERE ru.user_id = ?
        `;
        return await this.db.query(sql, [userId]);
    }

    async hasPermission(userId, permissionName) {
        const sql = `
            SELECT COUNT(*) as count
            FROM permissions p
            JOIN permission_role pr ON p.id = pr.permission_id
            JOIN role_user ru ON pr.role_id = ru.role_id
            WHERE ru.user_id = ? AND p.name = ?
        `;
        const result = await this.db.query(sql, [userId, permissionName]);
        return result[0].count > 0;
    }
}

module.exports = new User();