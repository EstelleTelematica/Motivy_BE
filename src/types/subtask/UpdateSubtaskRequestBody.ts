
import Joi from "joi";

export interface UpdateSubtaskRequestBody {
    name?: string;
    description?: string;
    colour?: string;
    isCompleted?: boolean;
    startAt?: Date;
    finishAt?: Date;
}