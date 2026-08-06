import { Request, Response } from "express";
import { loginUser, logOutUser, refreshAccessToken, signUpUser } from "../services/auth.service";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const login = async (req: Request, res: Response) => {
    try {
        //console.log(req);
        const email = req.body.email; //seleziona l'email dal body della request
        const password = req.body.password; //seleziona la password dal body della request
        const result = await loginUser(email, password); //
        res.status(result.statusCode).json(result); //assegna alla risposta uno statuts dato dal valore di ritorno della funzione statusCode e un messaggio contenente sia l'email ch la password
    } catch (error) {
        console.log("Errore inaspettato nel controller"); //segnala un erorore sul terminale
        res.status(500).json({ message: "Errore interno del server" }); //assegna alla risposta uno status 500 e un messaggio di errore interno al server
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const result = await logOutUser(refreshToken);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Errore inaspettato nel controller");
        res.status(500).json({ message: "Errore interno del server" });
    }
};

export const signUp = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const result = await signUpUser(data);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("Errore inaspettato nel controller");
        res.status(500).json({ message: "Errore interno del server" });
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
        console.log("Errore inaspettato del controller");
        res.status(500).json({ message: "Errore interno del server" });
    }
};


export const getMe = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.userId;
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.log("Errore inaspettato del controller");
        return res.status(500).json({
            success: false,
            message: "Errore interno del server"
        });
    }
};
