

import { UUID } from "crypto";

export interface RefreshToken {
    id: UUID;
    userId: UUID;
    hashToken: string;
    createdAt: Date;
    lastUpdate?: Date;
    expiresAt: Date;
    isRevoked: boolean;
}