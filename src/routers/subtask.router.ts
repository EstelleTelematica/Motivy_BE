import express from "express";
import { createOneSubtask, deleteOneSubtask, getAllSubtasks, getOneSubtask, updateOneSubtask } from "../controllers/subtask.controller";

const router = express.Router(); //expresse riconosce questo file come router

router.get("/", getAllSubtasks);

router.get("/:subtaskId", getOneSubtask);

router.post("/", createOneSubtask);

router.patch("/:subtaskId", updateOneSubtask);

router.delete("/:subtaskId", deleteOneSubtask);

export default router;
