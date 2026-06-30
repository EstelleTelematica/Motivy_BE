import Joi from "joi";

export interface CreateSubtaskRequestBody {
    name: string;
    description?: string;
    colour?: string;
    isCompleted: boolean;
    startAt?: Date;
    finishAt?: Date;
}