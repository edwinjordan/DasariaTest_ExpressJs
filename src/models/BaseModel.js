const database = require('../config/database');

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = database;
    }

    async findAll(conditions = {}, orderBy = 'id DESC', limit = null) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => {
                params.push(conditions[key]);
                return `${key} = ?`;
            }).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }

        sql += ` ORDER BY ${orderBy}`;

        if (limit) {
            sql += ` LIMIT ${limit}`;
        }

        return await this.db.query(sql, params);
    }

    async findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await this.db.query(sql, [id]);
        return results[0] || null;
    }

    async findBy(conditions) {
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
        const params = Object.values(conditions);
        return await this.db.query(sql, params);
    }

    async findOneBy(conditions) {
        const results = await this.findBy(conditions);
        return results[0] || null;
    }

    async create(data) {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const params = Object.values(data);
        
        const result = await this.db.query(sql, params);
        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const fields = Object.keys(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        const params = [...Object.values(data), id];
        
        await this.db.query(sql, params);
        return await this.findById(id);
    }

    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await this.db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    async count(conditions = {}) {
        let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => {
                params.push(conditions[key]);
                return `${key} = ?`;
            }).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }

        const result = await this.db.query(sql, params);
        return result[0].count;
    }
}

module.exports = BaseModel;