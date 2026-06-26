import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { CreateTaskRequestBody, validateCreateTaskRequestBody } from "../types/task/CreateTaskRequestBody";
import { badRequest, created, internalError, notFound, success } from "../utils/responses"

export const retrieveAllTasks = async (userId: string) => {
    try {
        if (!userId) {
            return badRequest("UserId is missing");
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

export const generateOneTask = async (data: CreateTaskRequestBody, userId: string) => {
    try {
        if (!userId) {
            return badRequest("Missing user id");
        }
        const validationError = validateCreateTaskRequestBody(data);
        if (validationError) {
            return badRequest(validationError);
        }
        const { name, description, category, colour, startAt, finishAt } = data;
        //Prima di creare l'oggetto Task ci sono ulteriori controlli che posso fare sul Requestbody?
        //Aggiungere la proprietà booleano isCompleted per verificare se ha completato l'obbiettivo
        //se è già completato quando lo inserisce ovvero data di effettiva fine non sia precedente ad oggi
        //finishAt ci deve essere solo se isCompleted è true e al contrario assente se è false
        const taskData = {
            name: name,
            description: description,
            category: category,
            colour: colour,
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

