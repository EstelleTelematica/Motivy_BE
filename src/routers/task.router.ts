import express from "express";
import { createOneTask, deleteOneTask, editOneTask, getAllTasks, getOneTask } from "../controllers/task.controller";
import { decode } from "../middlewares/decode";
import subtaskRouter from "./subtask.router";

const router = express.Router(); //expresse riconosce questo file come router

router.use("/:taskId/subtasks", decode, subtaskRouter);

router.get('/', getAllTasks); //decode è una call back perché viene passata come parametro e lo so perhé non ha le tonde

router.get('/:id', getOneTask);

router.post('/', createOneTask);

router.patch('/:id', editOneTask);

router.delete('/:id', deleteOneTask);

export default router;