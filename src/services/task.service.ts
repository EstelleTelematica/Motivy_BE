import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateTaskRequestBody, validateCreateTaskRequestBody } from "../types/task/CreateTaskRequestBody";
import { validateTaskId } from "../types/task/TaskIdRequestBody";
import { UpdateTaskRequestBody, validateUpdateTaskRequestBody } from "../types/task/UpdateTaskRequestBody";
import { badRequest, created, internalError, notFound, success } from "../utils/responses"

export const retrieveAllTasks = async (userId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }
        const validationIdError = validateTaskId(userId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return notFound("User not found");
        }
        const tasks = await taskRepository.findTasksByUser(user.id);
        return success(`Succesfully retrieved ${tasks.length} tasks`, { tasks });
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const retrieveOneTask = async (id: string, userId: string) => {
    try {

        if (!userId) {
            return badRequest("UserId is missing");
        }

        //creare un metodo per controllare che una stringa sia uno UUID V4 valido, se è valido vai avanti se no ritorno un bad request 
        const validationIdError = validateTaskId(id);
        if (validationIdError) {
            return badRequest(validationIdError);
        }
        const task = await taskRepository.findById(id);
        if (!task) {
            return notFound("Task not found");
        }
        //controllare se task.userId sia uguale allo userid che mi arriva come parametro in ingresso
        if (task.userId != userId) {
            return badRequest("Task not found") //non dobbiamo dare all'hacker indizi se sta accedendo ad un task non suo :)
        }

        return success(`Succesfully retrieved the task`, { task });
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const generateOneTask = async (data: CreateTaskRequestBody, userId: string) => {
    try {

        if (!userId) {
            return badRequest("UserId is missing");
        }

        const validationIdError = validateTaskId(userId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }
        const validationTaskError = validateCreateTaskRequestBody(data);
        if (validationTaskError) {
            return badRequest(validationTaskError);
        }

        const { name, description, category, colour, isCompleted, startAt, finishAt } = data;
        //Prima di creare l'oggetto Task ci sono ulteriori controlli che posso fare sul Requestbody?
        //se è già completato quando lo inserisce ovvero data di effettiva fine sia precedente ad oggi
        //finishAt ci deve essere solo se isCompleted è true e al contrario assente se è false

        if ((startAt && finishAt) && (startAt > finishAt)) {
            return badRequest("Finish date precedes start date");
        }
        if (!finishAt && isCompleted) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Required finish date");
        }
        if (finishAt && !isCompleted) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Invalid isCompleted");
        }
        if (finishAt && isCompleted && finishAt.getTime() > Date.now()) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Invalid finish date");
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
        return created("Successfully created task", task);

    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}


export const updateOneTask = async (data: UpdateTaskRequestBody, taskId: string, userId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
        }

        const validationIdError = validateTaskId(userId);
        if (validationIdError) {
            return badRequest(validationIdError);
        }

        const currentTask = await taskRepository.findById(taskId);
        if (!currentTask) {
            return notFound("Task not found");
        }

        //controllare se task.userId sia uguale allo userId che mi arriva come parametro in ingresso
        if (currentTask.userId != userId) {
            return badRequest("Task not found") //non dobbiamo dare all'hacker indizi se sta accedendo ad un task non suo :)
        }

        const validationTaskError = validateUpdateTaskRequestBody(data);
        if (validationTaskError) {
            return badRequest(validationTaskError);
        }

        const { name, description, category, colour, isCompleted, startAt, finishAt } = data;

        //CAPIRE COME FARE AD IMPLEMENTARE UNA LOGICA CHE CONSERVA I VALORI DEL CURRENT TASK E MODIFICA SOLO I VALORI PASSATI IN INGRESSO

        if ((startAt && finishAt) && (startAt > finishAt)) {
            return badRequest("Finish date precedes start date");
        }
        if (!finishAt && isCompleted) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Required finish date");
        }
        if (finishAt && !isCompleted) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Invalid isCompleted");
        }
        if (finishAt && isCompleted && finishAt.getTime() > Date.now()) { //trasformo finisht in un valore numerico per il confronto con now() che restituisce un valore numerico
            return badRequest("Invalid finish date");
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
        return created("Successfully updated task", task);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

