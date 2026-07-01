import { subtaskRepository } from "../db/repositories/subtask.repository";
import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateSubtaskRequestBody, validateCreateSubtaskRequestBody } from "../types/subtask/CreateSubtaskRequestBody";
import { UpdateSubtaskRequestBody, validateUpdateSubtaskRequestBody } from "../types/subtask/UpdateSubtaskRequestBody";
import { badRequest, internalError, notFound, success } from "../utils/responses";
import { validateId } from "../utils/validation";

export const retrieveAllSubtasks = async (userId: string, taskId: string) => {
    try {
        console.log("valoreeeee:     ", userId);
        if (!userId) {
            return badRequest("UserId is missing");
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("User not found");
            console.log("dentro if:     ", user);
        }

        if (!taskId) {
            return badRequest("TaskId is missing");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            return badRequest(validationTaskIdError);
        }
        const task = await taskRepository.findById(taskId);
        console.log(task);
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

export const retrieveOneSubtask = async (taskId: string, userId: string, subtaskId: string) => {
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

export const generateOneSubtask = async (data: CreateSubtaskRequestBody, taskId: string, userId: string) => {
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
        const validationSubtaskError = validateCreateSubtaskRequestBody(data);
        if (validationSubtaskError) {
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
            return badRequest("Finish date precedes start date");
        }
        if (!finishDate && isCompleted === true) {
            return badRequest("Required finish date");
        }
        if (finishDate && isCompleted === false) {
            return badRequest("Invalid isCompleted");
        }
        if (finishDate && isCompleted === true && finishDate.getTime() > now) {
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
        const subtask = await subtaskRepository.create(subtaskData)
        return success(`Succesfully created`, subtask);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
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
        const { name, description, colour, isCompleted, startAt, finishAt } = data;
        const startDate = startAt ? new Date(startAt) : null;
        const finishDate = finishAt ? new Date(finishAt) : null;
        const now = Date.now();
        if ((startDate && finishAt) && (startDate > finishAt)) {
            return badRequest("Finish date precedes start date");
        }
        if (!finishDate && isCompleted === true) {
            return badRequest("Required finish date");
        }
        if (finishDate && isCompleted === false) {
            return badRequest("Invalid isCompleted");
        }
        if (finishDate && isCompleted === true && finishDate.getTime() > now) {
            return badRequest("Invalid finish date");
        }

        //salvo subtask in memoria
        const subtask = await subtaskRepository.findAndUpdate({ id: subtaskId, taskId, userId }, subtaskData);
        return success("Successfully updated subtask", subtask[0]);

    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const removeOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }
        if (!taskId) {
            return badRequest("TaskId is missing");
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
        const currentSubtask = await subtaskRepository.findById(subtaskId);
        if (!currentSubtask) {
            return notFound("Subtask not found");
        }
        //controllo che il taskid del subtask sia l'id del task
        if (currentSubtask.taskId !== taskId) {
            return badRequest("This subtask is not associated with your task");
        }
        const subtask = await taskRepository.deleteById(taskId);
        const deleteSubtask = await taskRepository.findById(taskId);
        if (deleteSubtask == subtask || deleteSubtask) {
            return internalError("Subtask not deleted");
        }
        return success("Successfully removed subtask");
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
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