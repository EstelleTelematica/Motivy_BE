//estensione della classe wrapper: PostgreWrapper, 
// estensione specifica per i RefreshToken
//che richiama tutti i metodi della classe 

import { PostgresWrapper } from "../PostgresWrapper";
import pool from "../../db/db.config";
import { RefreshToken } from "../../models/RefreshToken";

const DB_SCHEMA = process.env.DB_SCHEMA;

class RefreshTokenRepository extends PostgresWrapper {
    constructor() {
        super(`"${DB_SCHEMA}"."RefreshToken"`);
    }

    async findValidToken(tokenHash: string): Promise<RefreshToken | null> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE "hashToken" = $1 AND "isRevoked" = FALSE AND "expiresAt" > NOW()`;
        const res = await pool.query(query, [tokenHash]);
        return res.rows[0] || null;
    }

    async revokeToken(tokenHash: string): Promise<boolean> {
        const query = 'UPDATE ${this.getTableName()} SET isRevoked = TRUE WHERE "hashToken" = $1';
        const res = await pool.query(query, [tokenHash]);
        return res.rowCount ? res.rowCount > 0 : false;
    }

    //condizione ? true : false
    // 1 < 2 ? console.log("minore") : console.log("maggiore")
}

export const refreshTokenRepository = new RefreshTokenRepository();

