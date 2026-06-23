import { User } from "../../models/User";
import { PostgresWrapper } from "../PostgresWrapper";
import pool from "../../db/db.config";

const DB_SCHEMA = process.env.DB_SCHEMA;

export class UserRepository extends PostgresWrapper {
    constructor() {
        super(`"${DB_SCHEMA}"."User"`);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE email = $1`;
        const res = await pool.query(query, [email]);
        return res.rows[0] || null;
    }
}

export const userRepository = new UserRepository();