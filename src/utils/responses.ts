
import { MotivyAPIResponse } from "../types/MotivyAPIResponse";

export const badRequest = (message: string): MotivyAPIResponse => ({
    statusCode: 400,
    data: null,
    message,
    success: false,
});

export const forbidden = (message: string): MotivyAPIResponse => ({
    statusCode: 403,
    data: null,
    message,
    success: false,
});

export const notFound = (message: string): MotivyAPIResponse => ({
    statusCode: 404,
    data: null,
    message,
    success: false,
});

export const internalError = (message: string): MotivyAPIResponse => ({
    statusCode: 500,
    data: null,
    message,
    success: false,
});

export const success = (message: string, data: any = null): MotivyAPIResponse => ({
    statusCode: 200,
    data,
    message,
    success: true,
});

export const created = (message: string, data: any = null): MotivyAPIResponse => ({
    statusCode: 201,
    data,
    message,
    success: true,
});
