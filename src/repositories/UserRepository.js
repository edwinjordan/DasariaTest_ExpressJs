const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return await this.model.findByEmail(email);
    }

    async findByUsername(username) {
        return await this.model.findByUsername(username);
    }

    async createUser(userData) {
        // Validate unique email and username
        const existingEmail = await this.findByEmail(userData.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const existingUsername = await this.findByUsername(userData.username);
        if (existingUsername) {
            throw new Error('Username already exists');
        }

        return await this.model.create(userData);
    }

    async updatePassword(id, newPassword) {
        return await this.model.updatePassword(id, newPassword);
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await this.model.verifyPassword(plainPassword, hashedPassword);
    }

    async getUserWithRoles(userId) {
        return await this.model.getUserWithRoles(userId);
    }

    async assignRole(userId, roleId) {
        return await this.model.assignRole(userId, roleId);
    }

    async removeRole(userId, roleId) {
        return await this.model.removeRole(userId, roleId);
    }

    async getUserRoles(userId) {
        return await this.model.getUserRoles(userId);
    }

    async getUserPermissions(userId) {
        return await this.model.getUserPermissions(userId);
    }

    async hasPermission(userId, permissionName) {
        return await this.model.hasPermission(userId, permissionName);
    }

    async getActiveUsers() {
        return await this.findBy({ is_active: true });
    }

    async searchUsers(searchTerm, page = 1, limit = 10) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const sql = `
            SELECT u.*, GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN role_user ru ON u.id = ru.user_id
            LEFT JOIN roles r ON ru.role_id = r.id
            WHERE 
                u.username LIKE ? OR 
                u.email LIKE ? OR 
                u.full_name LIKE ?
            GROUP BY u.id
            ORDER BY u.full_name ASC
            LIMIT ${limitNum} OFFSET ${offset}
        `;
        const searchPattern = `%${searchTerm}%`;
        const data = await this.model.db.query(sql, [
            searchPattern, searchPattern, searchPattern
        ]);

        // Format roles
        data.forEach(user => {
            user.roles = user.roles ? user.roles.split(',') : [];
        });

        return data;
    }
}

module.exports = new UserRepository();