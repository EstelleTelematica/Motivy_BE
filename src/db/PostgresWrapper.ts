import { PoolClient } from "pg";
import pool from "./db.config";
import { UUID } from "crypto";

export class PostgresWrapper {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName; //il this punta ad una variabile/funzione presente nella classe che sta invocando questa variabile,
        //quindi se chiamo il costuttore dal task repository allora this farà riferimento ad una istanza di quella classe
    }

    public getTableName() {
        return this.tableName;
    }

    async create(data: any) {
        const columns = Object.keys(data).map((col) => `"${col}"`).join(", ");
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const res = await pool.query(query, values);
        return res.rows[0];
    }

    /** 
    async createWithClient(client: PoolClient, data: any) {
        const columns = Object.keys(data).map((col) => `"${col}"`).join(", ");
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const res = await client.query(query, values);
        return res.rows[0];
    }
    */

    async createMany(data: any[]) {
        if (data.length === 0) return [];
        const columns = Object.keys(data[0]).map((col) => `"${col}"`).join(", ");
        const values = data.map((item, i) => {
            const keys = Object.keys(item);
            const placeholders = keys.map((_, j) => `$${i * keys.length + j + 1}`).join(", ");
            return `(${placeholders})`;
        }).join(", ");
        const flatValues = data.flatMap((item) => Object.values(item));
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES ${values} RETURNING *`;
        const res = await pool.query(query, flatValues);
        return res.rows;
    }

    /** 
    async createManyWithClient(client: PoolClient, data: any[]) {
        if (data.length === 0) return [];
        const columns = Object.keys(data[0]).map((col) => `"${col}"`).join(", ");
        const values = data.map((item, i) => {
            const keys = Object.keys(item);
            const placeholders = keys.map((_, j) => `$${i * keys.length + j + 1}`).join(", ");
            return `(${placeholders})`;
        }).join(", ");
        const flatValues = data.flatMap((item) => Object.values(item));
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES ${values} RETURNING *`;
        const res = await client.query(query, flatValues);
        return res.rows;
    }
    */

    async findById(id: string | UUID) {
        const query = `SELECT * FROM ${this.tableName} WHERE id=$1`;
        const res = await pool.query(query, [id]);
        return res.rows[0];
    }

    async findMany(filters = {}) {
        const keys = Object.keys(filters);
        const values = Object.values(filters);
        if (keys.length === 0) {
            const res = await pool.query(`SELECT * FROM ${this.tableName}`);
            return res.rows;
        }
        const conditions = keys.map((key, i) => `"${key}"=$${i + 1}`).join(" AND ");
        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions}`;
        const res = await pool.query(query, values);
        return res.rows;
    }

    async findOne(filters = {}) {
        const keys = Object.keys(filters);
        const values = Object.values(filters);
        if (keys.length === 0) {
            const res = await pool.query(`SELECT * FROM ${this.tableName}`);
            return res.rows;
        }
        const conditions = keys.map((key, i) => `"${key}"=$${i + 1}`).join(" AND ");
        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions}`;
        const res = await pool.query(query, values);
        return res.rows[0] || null;
    }

    async findAndUpdate(filters = {}, updateData = {}) {
        const filterKeys = Object.keys(filters);
        const filterValues = Object.values(filters); //taskId qui non gli piace
        const updateKeys = Object.keys(updateData);
        const updateValues = Object.values(updateData);
        const setClause = updateKeys.map((k, i) => `"${k}"=$${i + 1}`).join(", ");
        const whereClause = filterKeys.map((k, i) => `"${k}"=$${i + 1 + updateKeys.length}`).join(" AND ");
        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause} RETURNING *`;
        const res = await pool.query(query, [...updateValues, ...filterValues]);
        return res.rows;
    }

    async delete(filters = {}) {
        const keys = Object.keys(filters);
        const values = Object.values(filters);
        if (keys.length === 0) throw new Error("Delete requires filters!");
        const conditions = keys.map((key, i) => `"${key}"=$${i + 1}`).join(" AND ");
        const query = `DELETE FROM ${this.tableName} WHERE ${conditions} RETURNING *`;
        const res = await pool.query(query, values);
        return res.rows;
    }

    async deleteById(id: string | UUID) {
        const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING *`;
        const res = await pool.query(query, [id]);
        return res.rows[0];
    }

}



//const numbers = [1,2,3,4,5,6,7];
//const multiplied = numbers.map((num) => num * 2)
