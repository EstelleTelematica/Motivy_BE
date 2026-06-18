import express from "express";
import { login } from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", login); //login è una funzione di CALL BACK (non deve essere invocata perché passata in ingresso da un'altra funzione)
//post è una funzione che prende due parametri in ingresso ed  è definita in express
// la chiamata sarà di tipo: POST http://localhost:8080/login

/** 
router.post("/logout", logout);

router.post("/sign-up", signUp);
*/

export default router;