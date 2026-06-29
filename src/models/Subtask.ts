
import { UUID } from "crypto";

export interface Subtask {
    id: UUID;
    taskId: UUID;
    name: String;
    description?: String;
    isCompleted: boolean;
    startAt?: Date;
    finishAt?: Date;
    createdAt: Date;
    lastUpdate?: Date;
}