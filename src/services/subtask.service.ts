import pool from "../db/db.config";
import { subtaskRepository } from "../db/repositories/subtask.repository";
import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateSubtaskRequestBody, validateCreateSubtaskRequestBody } from "../types/subtask/CreateSubtaskRequestBody";
import { UpdateSubtaskRequestBody, validateUpdateSubtaskRequestBody } from "../types/subtask/UpdateSubtaskRequestBody";
import { badRequest, internalError, notFound, success } from "../utils/responses";
import { validateId } from "../utils/validation";

export const retrieveAllSubtasks = async (userId: string, taskId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("User not found");
        }

        if (!taskId) {
            return badRequest("TaskId is missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            return badRequest(validationTaskIdError);
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Task not found");
        }
        if (task.userId !== userId) {
            return badRequest("This task is not associated with your account");
        }
        const subtasks = await subtaskRepository.findSubtasksByTask(task.id);
        return success(`Succesfully retrieved ${subtasks.length} subtasks`, { subtasks });
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const retrieveOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }
        if (!taskId) {
            return badRequest("TaskId is missing");
        }
        if (!subtaskId) {
            return badRequest("SubtaskId is missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            return badRequest(validationTaskIdError);
        }
        const validationSubtaskIdError = validateId(subtaskId);
        if (validationSubtaskIdError) {
            return badRequest(validationSubtaskIdError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("User not found");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Task not found");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            return badRequest("This task is not associated with your account");
        }
        const subtask = await subtaskRepository.findById(subtaskId);
        if (!subtask) {
            return notFound("Subtask not found");
        }
        //controllo che il taskId del subtask sia il taskId in ingresso
        if (subtask.taskId !== taskId) {
            return badRequest("This subtask is not associated with your task");
        }
        return success("Succesfully retrieved subtask", subtask);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const generateOneSubtask = async (data: CreateSubtaskRequestBody, userId: string, taskId: string) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (!userId) {
            await client.query("ROLLBACK");
            return badRequest("UserId is missing");
        }
        if (!taskId) {
            await client.query("ROLLBACK");
            return badRequest("TaskId is missing");
        }
        if (!data) {
            await client.query("ROLLBACK");
            return badRequest("Subtask data are missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            await client.query("ROLLBACK");
            return badRequest(validationTaskIdError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            await client.query("ROLLBACK");
            return notFound("User not found");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            await client.query("ROLLBACK");
            return notFound("Task not found");
        }
        //controllo che tahsk id sia l'id in ingresso
        if (task.userId !== userId) {
            await client.query("ROLLBACK");
            return badRequest("This task is not associated with your account");
        }
        const validationSubtaskError = validateCreateSubtaskRequestBody(data);
        if (validationSubtaskError) {
            await client.query("ROLLBACK");
            return badRequest(validationSubtaskError);
        }

        //controlli sui valori da inserire nel subtask
        const { name, description, colour, isCompleted, startAt, finishAt } = data;
        const startDate = startAt ? new Date(startAt) : null;
        const finishDate = finishAt ? new Date(finishAt) : null;
        /*let startDate;
        if (startAt) { 
            // SE startAt esiste ed è valido (non è null, undefined o una stringa vuota)
            // Lo tasformo in un oggetto Date
            startDate = new Date(startAt);  
        } else { 
            // ALTRIMENTI (se l'utente non ha inserito la data di inizio)
            // Lo traformo in una variabile a null
            startDate = null;
        }
        */
        const now = Date.now();
        if ((startDate && finishAt) && (startDate > finishAt)) {
            await client.query("ROLLBACK");
            return badRequest("Finish date precedes start date");
        }
        if (!finishDate && isCompleted === true) {
            await client.query("ROLLBACK");
            return badRequest("Required finish date");
        }
        if (finishDate && isCompleted === false) {
            await client.query("ROLLBACK");
            return badRequest("Invalid isCompleted");
        }
        if (finishDate && isCompleted === true && finishDate.getTime() > now) {
            await client.query("ROLLBACK");
            return badRequest("Invalid finish date");
        }
        //creazione subtask
        const subtaskData = {
            taskId: taskId,
            name: name,
            description: description,
            colour: colour,
            isCompleted: isCompleted,
            startAt: startAt,
            finishAt: finishAt
        }
        const subtask = await subtaskRepository.createWithClient(client, subtaskData);
        //se hasSubtask è falso allora lo setto a true
        if (!task.hasSubtask) {
            await taskRepository.findAndUpdateWithClient(client, { id: taskId, userId }, { hasSubtask: true });
        }
        await client.query("COMMIT");
        return success(`Succesfully created`, subtask);
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Internal server error", error);
        return internalError("Internal server error");
    } finally {
        client.release();
    }
}

export const editOneSubtask = async (data: UpdateSubtaskRequestBody, userId: string, taskId: string, subtaskId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }
        if (!taskId) {
            return badRequest("TaskId is missing");
        }
        if (!data) {
            return badRequest("Subtask data are missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            return badRequest(validationTaskIdError);
        }
        const validationSubtaskIdError = validateId(subtaskId);
        if (validationSubtaskIdError) {
            return badRequest(validationSubtaskIdError);
        }
        const validationSubtaskBodyError = validateUpdateSubtaskRequestBody(data);
        if (validationSubtaskBodyError) {
            return badRequest(validationSubtaskBodyError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("User not found");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Task not found");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            return badRequest("This task is not associated with your account");
        }
        const currentSubtask = await subtaskRepository.findById(subtaskId);
        if (!currentSubtask) {
            return notFound("Subtask not found");
        }
        //controllo che il taskid del subtask sia l'id del task
        if (currentSubtask.taskId !== taskId) {
            return badRequest("This subtask is not associated with your task");
        }

        //creazione subtask
        const subtaskData = {
            name: data.name ?? currentSubtask.name,
            description: data.description ?? currentSubtask.description,
            colour: data.colour ?? currentSubtask.colour,
            isCompleted: data.isCompleted ?? currentSubtask.isCompleted,
            startAt: data.startAt ?? currentSubtask.startAt,
            finishAt: data.finishAt ?? currentSubtask.finishAt,
            lastUpdate: new Date(),
        };

        //controlli sui valori da inserire nel subtask
        const startDate = data.startAt ? new Date(data.startAt) : null;
        const finishDate = data.finishAt ? new Date(data.finishAt) : null;
        const now = Date.now();
        if ((startDate && finishDate) && (startDate > finishDate)) {
            return badRequest("Finish date precedes start date");
        }
        if (!finishDate && data.isCompleted === true) {
            return badRequest("Required finish date");
        }
        if (finishDate && data.isCompleted === false) {
            return badRequest("Invalid isCompleted");
        }
        if (finishDate && data.isCompleted === true && finishDate.getTime() > now) {
            return badRequest("Invalid finish date");
        }

        //salvo subtask nel data base
        const subtask = await subtaskRepository.findAndUpdate({ id: subtaskId, taskId }, subtaskData);
        return success("Successfully updated subtask", subtask[0]);

    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const removeOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    const client = await pool.connect();
    try {
        if (!userId) {
            await client.query("ROLLBACK");
            return badRequest("UserId is missing");
        }
        if (!taskId) {
            await client.query("ROLLBACK");
            return badRequest("TaskId is missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            await client.query("ROLLBACK");
            return badRequest(validationTaskIdError);
        }
        const validationSubtaskIdError = validateId(subtaskId);
        if (validationSubtaskIdError) {
            await client.query("ROLLBACK");
            return badRequest(validationSubtaskIdError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            await client.query("ROLLBACK");
            return notFound("User not found");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            await client.query("ROLLBACK");
            return notFound("Task not found");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            await client.query("ROLLBACK");
            return badRequest("This task is not associated with your account");
        }
        const currentSubtask = await subtaskRepository.findById(subtaskId);
        if (!currentSubtask) {
            await client.query("ROLLBACK");
            return notFound("Subtask not found");
        }
        //controllo che il taskid del subtask sia l'id del task
        if (currentSubtask.taskId !== taskId) {
            await client.query("ROLLBACK");
            return badRequest("This subtask is not associated with your task");
        }
        await subtaskRepository.deleteByIdWithClient(client, subtaskId);
        const n = await subtaskRepository.countSubtasksByTaskWithClient(client, taskId);
        if (task.hasSubtask && n == 0) {
            await taskRepository.findAndUpdateWithClient(client, { id: taskId, userId }, { hasSubtask: false });
        }
        await client.query("COMMIT");
        return success("Successfully removed subtask");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Internal server error", error);
        return internalError("Internal server error");
    } finally {
        client.release();
    }
}

/*
interface Human {
    age: number;
    gender: string;
    name: string;
    height: number;
    weight: number;
}

interface Test {
    getSomething(): never;
}

class Human {
    constructor(age: number, gender: string, name: string, height: number, weight: number) {
        age >= 18 ? this.age = age : 
        this.gender = gender;
        this.name = name;
        this.height = height;
        this.weight = weight;
    }

    getName() {
        return this.name;
    }
}

const human = new Human()

const human: Human = {
    weight: 89,
    name: "Pippo",
    height: 178,
    gender: "M",
    age: 20
};
*/




