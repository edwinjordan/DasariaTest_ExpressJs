const BaseRepository = require('./BaseRepository');
const Permission = require('../models/Permission');

class PermissionRepository extends BaseRepository {
    constructor() {
        super(Permission);
    }

    async findByName(name) {
        return await this.model.findByName(name);
    }

    async findByResource(resource) {
        return await this.model.findByResource(resource);
    }

    async getUniqueResources() {
        return await this.model.getUniqueResources();
    }

    async getRolesCount(permissionId) {
        return await this.model.getRolesCount(permissionId);
    }

    async getStats() {
        return await this.model.getStats();
    }

    async findAllWithPagination(limit, offset, filters = {}) {
        return await this.model.findAllWithStats(limit, offset, filters);
    }
}

module.exports = new PermissionRepository();