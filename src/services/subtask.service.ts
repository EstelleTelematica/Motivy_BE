import { CreateSubtaskRequestBody } from "../types/subtask/CreateSubtaskRequestBody";
import { UpdateSubtaskRequestBody } from "../types/subtask/UpdateSubtaskRequestBody";
import { UpdateTaskRequestBody } from "../types/task/UpdateTaskRequestBody";
import { internalError, success } from "../utils/responses";


export const retrieveAllSubtasks = async (userId: string, taskId: string) => {
    try {
        const tasks = [0, 1];
        return success(`Succesfully retrieved ${tasks.length} tasks`, { tasks });
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const retrieveOneSubtask = async (taskId: string, userId: string, subtaskId: string) => {
    try {
        const task = 0;
        return success(`Succesfully retrieved`, task);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const generateOneSubtask = async (data: CreateSubtaskRequestBody, taskId: string, userId: string) => {
    try {
        const task = 0;
        return success(`Succesfully created`, task);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const editOneSubtask = async (data: UpdateSubtaskRequestBody, userId: string, taskId: string, subtaskId: string) => {
    try {
        const task = 0;
        return success(`Succesfully edited`, task);
    } catch (error) {
        console.log("Internal server error", error);
        return internalError("Internal server error");
    }
}

export const removeOneSubtask = async (userId: string, taskId: string, subtaskId: string) => {
    try {
        return success(`Succesfully deleted`);
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