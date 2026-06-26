import { Request, Response } from "express"
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { generateOneTask, retrieveAllTasks } from "../services/task.service";


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
        const { data } = authReq.body;
        const result = await generateOneTask(data, authReq.userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
