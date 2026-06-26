
import { UUID } from "crypto";

export interface Task {
    id: UUID;
    userId: UUID;
    name: String;
    description?: String;
    category?: String;
    colour?: String;
    startAt?: Date;
    finishAt?: Date;
    createdAt: Date;
    lastUpdate?: Date;
    hasSubtask: boolean;
}