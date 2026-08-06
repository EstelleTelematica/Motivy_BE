import pool from "../db/db.config";
import { subtaskRepository } from "../db/repositories/subtask.repository";
import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateSubtaskRequestBody, validateCreateSubtaskRequestBody } from "../types/subtask/CreateSubtaskRequestBody";
import { UpdateSubtaskRequestBody, validateUpdateSubtaskRequestBody } from "../types/subtask/UpdateSubtaskRequestBody";
import { badRequest, internalError, notFound, success, created } from "../utils/responses";
import { validateId } from "../utils/validation";

export const retrieveAllSubtasks = async (userId: string, taskId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("Utente non trovato");
        }

        if (!taskId) {
            return badRequest("Id obiettivo non trovato");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            return badRequest(validationTaskIdError);
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Obiettivo non trovato");
        }
        if (task.userId !== userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const subtasks = await subtaskRepository.findSubtasksByTask(task.id);
        return success(`Recuperati con successo ${subtasks.length} sottobiettivi`, { subtasks });
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const retrieveOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }
        if (!taskId) {
            return badRequest("Id obiettivo non trovato");
        }
        if (!subtaskId) {
            return badRequest("Id sottobiettivo non trovato");
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
            return notFound("Utente non trovato");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Obiettivo non trovato");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const subtask = await subtaskRepository.findById(subtaskId);
        if (!subtask) {
            return notFound("Sottobiettivo non trovato");
        }
        //controllo che il taskId del subtask sia il taskId in ingresso
        if (subtask.taskId !== taskId) {
            return badRequest("Questo sottobiettivo non è associato a questo obiettivo");
        }
        return success("Sottobiettivo recuperato con successo", subtask);
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const generateOneSubtask = async (data: CreateSubtaskRequestBody, userId: string, taskId: string) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (!userId) {
            await client.query("ROLLBACK");
            return badRequest("Id utente non trovato");
        }
        if (!taskId) {
            await client.query("ROLLBACK");
            return badRequest("Id obiettivo non trovato");
        }
        if (!data) {
            await client.query("ROLLBACK");
            return badRequest("Dati del sottobiettivo non trovati");
        }
        const validationTaskIdError = validateId(taskId);
        if (validationTaskIdError) {
            await client.query("ROLLBACK");
            return badRequest(validationTaskIdError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            await client.query("ROLLBACK");
            return notFound("Utente non trovato");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            await client.query("ROLLBACK");
            return notFound("Obiettivo non trovato");
        }
        //controllo che tahsk id sia l'id in ingresso
        if (task.userId !== userId) {
            await client.query("ROLLBACK");
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const validationSubtaskError = validateCreateSubtaskRequestBody(data);
        if (validationSubtaskError) {
            await client.query("ROLLBACK");
            return badRequest(validationSubtaskError);
        }

        const { name, description, colour, isCompleted } = data;

        const startAtValue = data.startAt;
        const finishAtValue = data.finishAt;

        const startDate = startAtValue ? new Date(startAtValue) : undefined;
        const finishDate = finishAtValue ? new Date(finishAtValue) : undefined;

        const now = Date.now();

        if (startDate && finishDate && startDate.getTime() > finishDate.getTime()) {
            await client.query("ROLLBACK");
            return badRequest("La data di fine precede la data d'inizio");
        }
        if (!finishDate && isCompleted === true) {
            await client.query("ROLLBACK");
            return badRequest("Data di fine mancante per un sottobiettivo completato");
        }
        if (finishDate && isCompleted === false) {
            await client.query("ROLLBACK");
            return badRequest("Impossibile assegnare una data di fine a un sottobiettivo non completato");
        }
        if (finishDate && isCompleted === true && finishDate.getTime() > now) {
            await client.query("ROLLBACK");
            return badRequest("La data di fine non può essere nel futuro");
        }

        if (task.startAt && startDate) {
            if (startDate.getTime() < new Date(task.startAt).getTime()) {
                await client.query("ROLLBACK");
                return badRequest("La data di inizio del sottobiettivo non può precedere la data di inizio dell'obiettivo");
            }
        }
        if (task.finishAt && finishDate) {
            if (finishDate.getTime() > new Date(task.finishAt).getTime()) {
                await client.query("ROLLBACK");
                return badRequest("La data di fine del sottobiettivo non può seguire la data di fine dell'obiettivo");
            }
        }
        if (task.isCompleted && !isCompleted) {
            await client.query("ROLLBACK");
            return badRequest("Non è possibile avere un sottobiettivo incompleto se l'obiettivo risulta completato");
        }

        //creazione subtask
        const subtaskData = {
            taskId: taskId,
            name: name,
            description: description,
            colour: colour,
            isCompleted: isCompleted,
            startAt: startDate,
            finishAt: finishDate
        }

        const subtask = await subtaskRepository.createWithClient(client, subtaskData);
        //se hasSubtask è falso allora lo setto a true
        if (!task.hasSubtask) {
            await taskRepository.findAndUpdateWithClient(client, { id: taskId, userId }, { hasSubtask: true });
        }
        await client.query("COMMIT");
        return created(`Sottobiettivo creato con successo`, subtask);
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    } finally {
        client.release();
    }
}

export const editOneSubtask = async (data: UpdateSubtaskRequestBody, userId: string, taskId: string, subtaskId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }
        if (!taskId) {
            return badRequest("Id obiettivo non trovato");
        }
        if (!data) {
            return badRequest("Dati del sottobiettivo non trovati");
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
            return notFound("Utente non trovato");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Obiettivo non trovato");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const currentSubtask = await subtaskRepository.findById(subtaskId);
        if (!currentSubtask) {
            return notFound("Sottobiettivo non trovato");
        }
        //controllo che il taskid del subtask sia l'id del task
        if (currentSubtask.taskId !== taskId) {
            return badRequest("Questo sottobiettivo non è associato a questo obiettivo");
        }

        const startAtValue = data.startAt !== undefined ? data.startAt : currentSubtask.startAt;
        const finishAtValue = data.finishAt !== undefined ? data.finishAt : currentSubtask.finishAt;
        const isCompleted = data.isCompleted !== undefined ? data.isCompleted : currentSubtask.isCompleted;

        const startDate = startAtValue ? new Date(startAtValue) : undefined;
        const finishDate = finishAtValue ? new Date(finishAtValue) : undefined;

        const now = Date.now();

        if (startDate && finishDate && startDate.getTime() > finishDate.getTime()) {
            return badRequest("La data di fine non può precedere la data di inizio");
        }
        if (!finishDate && isCompleted === true) {
            return badRequest("Data di fine mancante per un sottobiettivo completato");
        }
        if (finishDate && isCompleted === false) {
            return badRequest("Impossibile assegnare una data di fine a un sottobiettivo non completato");
        }
        if (finishDate && isCompleted === true && finishDate.getTime() > now) {
            return badRequest("La data di fine non può essere nel futuro");
        }

        if (task.startAt && startDate) {
            if (startDate.getTime() < new Date(task.startAt).getTime()) {
                return badRequest("Il sottobiettivo non può avere una data di inizio che precede la data di inizio dell'obiettivo");
            }
        }
        if (task.finishAt && finishDate) {
            if (finishDate.getTime() > new Date(task.finishAt).getTime()) {
                return badRequest("La data di fine del sottobiettivo non può seguire la data di fine dell'obiettivo");
            }
        }
        if (task.isCompleted && !isCompleted) {
            return badRequest("Non è possibile avere un sottobiettivo incompleto se l'obiettivo è completato");
        }

        //preparazione dati da salvare
        const subtaskData = {
            name: data.name ?? currentSubtask.name,
            description: data.description ?? currentSubtask.description,
            colour: data.colour ?? currentSubtask.colour,
            isCompleted: isCompleted,
            startAt: startDate,
            finishAt: finishDate,
            lastUpdate: new Date(),
        };

        //salvo subtask nel data base
        const subtask = await subtaskRepository.findAndUpdate({ id: subtaskId, taskId }, subtaskData);
        return success("Sottobiettivo aggiornato con successo", subtask[0]);

    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const removeOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    const client = await pool.connect();
    try {
        if (!userId) {
            await client.query("ROLLBACK");
            return badRequest("Id utente non trovato");
        }
        if (!taskId) {
            await client.query("ROLLBACK");
            return badRequest("Id obiettivo non trovato");
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
            return notFound("Utente non trovato");
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            await client.query("ROLLBACK");
            return notFound("Obiettivo non trovato");
        }
        //controllo che task id sia l'id in ingresso
        if (task.userId !== userId) {
            await client.query("ROLLBACK");
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const currentSubtask = await subtaskRepository.findById(subtaskId);
        if (!currentSubtask) {
            await client.query("ROLLBACK");
            return notFound("Sottobiettivo non trovato");
        }
        //controllo che il taskid del subtask sia l'id del task
        if (currentSubtask.taskId !== taskId) {
            await client.query("ROLLBACK");
            return badRequest("Questo sottobiettivo non è associato a questo obiettivo");
        }
        await subtaskRepository.deleteByIdWithClient(client, subtaskId);
        const n = await subtaskRepository.countSubtasksByTaskWithClient(client, taskId);
        if (task.hasSubtask && n == 0) {
            await taskRepository.findAndUpdateWithClient(client, { id: taskId, userId }, { hasSubtask: false });
        }
        await client.query("COMMIT");
        return success("Sottobiettivo rimosso con successo");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
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