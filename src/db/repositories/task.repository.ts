import { Task } from "../../models/Task";
import pool from "../db.config";
import { PostgresWrapper } from "../PostgresWrapper";

const DB_SCHEMA = process.env.DB_SCHEMA;

class TaskRepository extends PostgresWrapper {
    constructor() {
        super(`"${DB_SCHEMA}"."Task"`);
    }
    async findTasksByUser(id: string): Promise<Task[]> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE "userId" = $1`;
        const res = await pool.query(query, [id]);
        return res.rows;
    }
}

export const taskRepository = new TaskRepository();