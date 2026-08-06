import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateTaskRequestBody, validateCreateTaskRequestBody } from "../types/task/CreateTaskRequestBody";
import { validateId } from "../utils/validation";
import { UpdateTaskRequestBody, validateUpdateTaskRequestBody } from "../types/task/UpdateTaskRequestBody";
import { badRequest, created, internalError, notFound, success } from "../utils/responses"

export const retrieveAllTasks = async (userId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("Utente non trovato");
        }
        const tasks = await taskRepository.findTasksByUser(user.id);
        return success(`Recuperati con successo ${tasks.length} obiettivi`, { tasks });
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const retrieveOneTask = async (taskId: string, userId: string) => {
    try {

        if (!userId) {
            return badRequest("Id utente non trovato");
        }

        //creare un metodo per controllare che una stringa sia uno UUID V4 valido, se è valido vai avanti se no ritorno un bad request 
        const validationIdError = validateId(taskId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }
        const task = await taskRepository.findById(taskId);
        if (!task) {
            return notFound("Obiettivo non trovato");
        }
        //controllare se task.userId sia uguale allo userid che mi arriva come parametro in ingresso
        if (task.userId != userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        return success(`Obiettivo recuperato con successo`, { task });
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const generateOneTask = async (data: CreateTaskRequestBody, userId: string) => {
    try {

        if (!userId) {
            return badRequest("Id utente non trovato");
        }

        const validationTaskError = validateCreateTaskRequestBody(data);
        if (validationTaskError) {
            return badRequest(validationTaskError);
        }

        const { name, description, category, colour, isCompleted} = data;
        //Prima di creare l'oggetto Task ci sono ulteriori controlli che posso fare sul Requestbody?
        //se è già completato quando lo inserisce ovvero data di effettiva fine sia precedente ad oggi
        //finishAt ci deve essere solo se isCompleted è true e al contrario assente se è false
        const startAt = data.startAt ? new Date(data.startAt) : undefined;
        const finishAt = data.finishAt ? new Date(data.finishAt) : undefined;

        if ((startAt && finishAt) && (startAt.getTime() > finishAt.getTime())) {
            return badRequest("La data di fine non può precedere la data di inizio");
        }
        if (!finishAt && isCompleted == true) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Data di fine mancante per un obiettivo completato");
        }
        if (finishAt && isCompleted == false) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Impossibile assegnare una data di fine a un obiettivo non completato");
        }
        if (finishAt && isCompleted == true && finishAt.getTime() > Date.now()) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("La data di fine non può essere nel futuro");
        }

        const taskData = {
            name: name,
            description: description,
            category: category,
            colour: colour,
            isCompleted: isCompleted,
            startAt: startAt,
            finishAt: finishAt,
            userId: userId,
            hasSubtask: false,
        }

        const task = await taskRepository.create(taskData);
        return created("Obiettivo creato con successo", task);

    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}


export const updateOneTask = async (data: UpdateTaskRequestBody, taskId: string, userId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }

        const validationIdError = validateId(taskId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }

        const validationTaskError = validateUpdateTaskRequestBody(data);
        if (validationTaskError) {
            return badRequest(validationTaskError);
        }

        const currentTask = await taskRepository.findById(taskId);
        if (!currentTask) {
            return notFound("Obiettivo non trovato");
        }

        //controllare se task.userId sia uguale allo userId che mi arriva come parametro in ingresso
        if (currentTask.userId != userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }

        const inputStartAt = data.startAt !== undefined ? data.startAt : currentTask.startAt;
        const inputFinishAt = data.finishAt !== undefined ? data.finishAt : currentTask.finishAt;
        const isCompleted = data.isCompleted !== undefined ? data.isCompleted : currentTask.isCompleted;

        const startAt =inputStartAt ? new Date(inputStartAt) : undefined;
        const finishAt = inputFinishAt ? new Date(inputFinishAt) : undefined;

        // Controlli di validità date
        if (startAt && finishAt && (startAt.getTime() > finishAt.getTime())) {
            return badRequest("La data di fine non può precedere la data di inizio");
        }
        if (!finishAt && isCompleted) {
            return badRequest("Data di fine mancante per un obiettivo completato");
        }
        if (finishAt && !isCompleted) {
            return badRequest("Impossibile assegnare una data di fine a un obiettivo non completato");
        }
        if (finishAt && isCompleted && finishAt.getTime() > Date.now()) {
            return badRequest("La data di fine non può essere nel futuro");
        }

        const taskData = {
            name: data.name ?? currentTask.name,
            description: data.description ?? currentTask.description,
            category: data.category ?? currentTask.description,
            colour: data.colour ?? currentTask.colour,
            isCompleted: data.isCompleted ?? currentTask.isCompleted,
            startAt: data.startAt ?? currentTask.startAt,
            finishAt: data.finishAt ?? currentTask.finishAt,
            lastUpdate: new Date(),
        };

        const task = await taskRepository.findAndUpdate({ id: taskId, userId }, taskData);
        return success("Obiettivo aggiornato con successo", task[0]);

    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

export const removeOneTask = async (taskId: string, userId: string) => {
    try {
        if (!userId) {
            return badRequest("Id utente non trovato");
        }

        const validationIdError = validateId(taskId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }

        const currentTask = await taskRepository.findById(taskId);
        if (!currentTask) {
            return notFound("Obiettivo non trovato");
        }

        if (currentTask.userId != userId) {
            return badRequest("Questo obiettivo non è associato al tuo account");
        }
        const task = await taskRepository.deleteById(taskId);

        const deleteTask = await taskRepository.findById(taskId);
        if (deleteTask) {
            return internalError("Obiettivo non eliminato");
        }
        return success("Obiettivo rimosso con successo");
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}

