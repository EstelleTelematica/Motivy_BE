import express from "express";
import { getAllTasks } from "../controllers/task.controller";
import { decode } from "../middlewares/decode";

const router = express.Router();

router.get('/', decode, getAllTasks); //decode è una call back perché viene passata come parametro e lo so perhé non ha le tonde

//router.get('/:id', getOneTask);

//router.post('/', createOneTask);

//router.patch('/:id', editOneTask);

//router.delete('/:id', deleteOneTask);

export default router;