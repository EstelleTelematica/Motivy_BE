import { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const result = await loginUser(email, password);
        res.status(result.statusCode).json(result);
    } catch(error) {
        console.log("Unexpected error in controller");
        res.status(500).json({message: "Internal server error"});
    }
};

export const logout = async (req, res) => {
     try {

    } catch(error) {

    }
};

export const signUp = async (req, res) => {
     try {

    } catch(error) {

    }
};



