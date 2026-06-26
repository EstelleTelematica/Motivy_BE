
import { UUID } from "crypto";

export interface Task {
    id: UUID;
    userId: UUID;
    name: string;
    description?: string;
    category?: string;
    colour?: string;
    startAt?: Date;
    finishAt?: Date;
    createdAt: Date;
    lastUpdate?: Date;
    hasSubtask: boolean;
}