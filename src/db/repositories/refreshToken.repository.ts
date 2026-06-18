import { PostgresWrapper } from "../PostgresWrapper";
import pool from "../../db/db.config";

const DB_SCHEMA = process.env.DB_SCHEMA;

export class RefreshTokenRepository extends PostgresWrapper {
    constructor() {
        super(`"${DB_SCHEMA}"."refresh_tokens"`);
    }
}

export const refreshTokenRepository = new RefreshTokenRepository();