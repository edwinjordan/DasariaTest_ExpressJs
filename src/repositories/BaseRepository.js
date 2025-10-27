class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(conditions = {}, orderBy = 'id DESC', limit = null) {
        return await this.model.findAll(conditions, orderBy, limit);
    }

    async findById(id) {
        const result = await this.model.findById(id);
        if (!result) {
            throw new Error(`Record with id ${id} not found`);
        }
        return result;
    }

    async findBy(conditions) {
        return await this.model.findBy(conditions);
    }

    async findOneBy(conditions) {
        return await this.model.findOneBy(conditions);
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(id, data) {
        const exists = await this.model.findById(id);
        if (!exists) {
            throw new Error(`Record with id ${id} not found`);
        }
        return await this.model.update(id, data);
    }

    async delete(id) {
        const exists = await this.model.findById(id);
        if (!exists) {
            throw new Error(`Record with id ${id} not found`);
        }
        return await this.model.delete(id);
    }

    async count(conditions = {}) {
        return await this.model.count(conditions);
    }

    async paginate(page = 1, limit = 10, conditions = {}, orderBy = 'id DESC') {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const total = await this.count(conditions);
        const totalPages = Math.ceil(total / limitNum);
        
        let sql = `SELECT * FROM ${this.model.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => {
                params.push(conditions[key]);
                return `${key} = ?`;
            }).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }

        sql += ` ORDER BY ${orderBy} LIMIT ${limitNum} OFFSET ${offset}`;

        const data = await this.model.db.query(sql, params);

        return {
            data,
            pagination: {
                current_page: pageNum,
                per_page: limitNum,
                total,
                total_pages: totalPages,
                has_next: pageNum < totalPages,
                has_prev: pageNum > 1
            }
        };
    }
}

module.exports = BaseRepository;