import express from "express";
import { createOneTask, editOneTask, getAllTasks, getOneTask } from "../controllers/task.controller";
import { decode } from "../middlewares/decode";

const router = express.Router(); //expresse riconosce questo file come router

router.get('/', decode, getAllTasks); //decode è una call back perché viene passata come parametro e lo so perhé non ha le tonde

router.get('/:id', decode, getOneTask);

router.post('/', decode, createOneTask);

router.patch('/:id', decode, editOneTask);

//router.delete('/:id', decode, deleteOneTask);

export default router;