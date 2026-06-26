import { taskRepository } from "../db/repositories/task.repository";
import { userRepository } from "../db/repositories/user.repository";
import { badRequest, internalError, notFound, success } from "../utils/responses"

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

