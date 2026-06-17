

import {UUID} from "crypto";

export interface RefreshToken{
    id: UUID;
    userId: UUID;
    hashToken: string;
    createdAt: Date;
    lastUptade: Date;
    expiresAt: Date;
    isRevoked: boolean;
}