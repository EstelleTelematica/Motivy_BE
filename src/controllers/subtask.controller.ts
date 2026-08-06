import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { editOneSubtask, generateOneSubtask, removeOneSubtask, retrieveAllSubtasks, retrieveOneSubtask } from "../services/subtask.service";

export const getAllSubtasks = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const { taskId } = authReq.params; //informazione ricavata con l'aiuto dell'AI 
        const result = await retrieveAllSubtasks(userId, taskId);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Errore interno del server", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
}

export const getOneSubtask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const { taskId, subtaskId } = authReq.params;
        const result = await retrieveOneSubtask(userId, taskId, subtaskId);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Errore interno del server", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
}

export const createOneSubtask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const data = authReq.body;
        const { taskId } = authReq.params;
        const result = await generateOneSubtask(data, userId, taskId);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Errore interno del server", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
}

export const updateOneSubtask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const data = authReq.body;
        const { taskId, subtaskId } = authReq.params;
        const result = await editOneSubtask(data, userId, taskId, subtaskId);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Errore interno del server", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
}

export const deleteOneSubtask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const { taskId, subtaskId } = authReq.params;
        const result = await removeOneSubtask(userId, taskId, subtaskId);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Errore interno del server", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
}