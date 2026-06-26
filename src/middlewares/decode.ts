import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const decode = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; //il nostro token che passiamo da postman
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No Access Token Provided" });
    }
    const token = authHeader.replace("Bearer ", "");
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }; //access token
        // as { userId: string } è un modo per definire un tipo a typescript e specificarli quello che dovrà assseggnare
        (req as any).userId = decoded.userId; //typescript linguagggio che aggiunge un parametro userId alla richiesta per questa specifica istanza
        next(); //funzione middleware che dice passa al prossimo middleware
    } catch (error: any) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
