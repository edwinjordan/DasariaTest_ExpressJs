const BaseRepository = require('./BaseRepository');
const Role = require('../models/Role');

class RoleRepository extends BaseRepository {
    constructor() {
        super(Role);
    }

    async findByName(name) {
        return await this.model.findByName(name);
    }

    async findByIdWithPermissions(id) {
        return await this.model.findWithPermissions(id);
    }

    async assignPermissions(roleId, permissionIds) {
        return await this.model.assignPermissions(roleId, permissionIds);
    }

    async removePermissions(roleId, permissionIds) {
        return await this.model.removePermissions(roleId, permissionIds);
    }

    async getPermissions(roleId) {
        return await this.model.getPermissions(roleId);
    }

    async getUsersCount(roleId) {
        return await this.model.getUsersCount(roleId);
    }

    async getStats() {
        return await this.model.getStats();
    }

    async findAllWithPagination(limit, offset, filters = {}) {
        return await this.model.findAllWithStats(limit, offset, filters);
    }
}

module.exports = new RoleRepository();