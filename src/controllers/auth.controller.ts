import { Request, Response } from "express";
import { loginUser, logOutUser, refreshAccessToken, signUpUser } from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
    try {
        //console.log(req);
        const email = req.body.email; //seleziona l'email dal body della request
        const password = req.body.password; //seleziona la password dal body della request
        const result = await loginUser(email, password); //
        res.status(result.statusCode).json(result); //assegna alla risposta uno statuts dato dal valore di ritorno della funzione statusCode e un messaggio contenente sia l'email ch la password
    } catch (error) {
        console.log("Unexpected error in controller"); //segnala un erorore sul terminale
        res.status(500).json({ message: "Internal server error" }); //assegna alla risposta uno status 500 e un messaggio di errore interno al server
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const result = await logOutUser(refreshToken);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Unexpected error in controller");
        res.status(500).json({ message: "Internal server error" });
    }
};

export const signUp = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const result = await signUpUser(data);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Unexpected error in controller");
        res.status(500).json({ message: "Internal server error" });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        //const refreshToken = req.body.refreshToken;
        const { refreshToken } = req.body;
        const result = await refreshAccessToken(refreshToken);
        res.status(result.statusCode).json(result);
    }
    catch (error) {
        console.log("Unexpected error in controller");
        res.status(500).json({ message: "Internal server error" });
    }
};



