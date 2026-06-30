import { Request, Response } from "express"
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { generateOneTask, removeOneTask, retrieveAllTasks, retrieveOneTask, updateOneTask } from "../services/task.service";


export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const result = await retrieveAllTasks(userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/*

async (req: Request, res: Response) => {
    
}

const variabile = await (8, 5);

se senza nome e senza parametri e non sincrona:

(() => {
   ...   
})();

*/


export const createOneTask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const data = authReq.body;
        const userId = authReq.userId;
        const result = await generateOneTask(data, userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getOneTask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const { id } = authReq.params; //informazione ricavata con l'aiuto dell'AI 
        const result = await retrieveOneTask(id, userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const editOneTask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const data = authReq.body;
        const { id } = authReq.params;
        const result = await updateOneTask(data, id, userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteOneTask = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.userId;
        const { id } = authReq.params;
        const result = await removeOneTask(id, userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

