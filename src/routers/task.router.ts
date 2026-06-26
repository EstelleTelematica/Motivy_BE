import express from "express";
import { getAllTasks } from "../controllers/task.controller";

const router = express.Router();

router.get('/', getAllTasks);

//router.get('/:id', getOneTask);

//router.post('/', createOneTask);

//router.patch('/:id', editOneTask);

//router.delete('/:id', deleteOneTask);

export default router;