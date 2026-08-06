import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { userRepository } from "../db/repositories/user.repository";
import { refreshTokenRepository } from "../db/repositories/refreshToken.repository";
import { badRequest, created, forbidden, internalError, success, unauthorized } from "../utils/responses";
import { SignUpRequestBody, validateSignUpRequestBody } from "../types/user/SignUpRequestBody";

const JWT_SECRET = process.env.JWT_SECRET || ""; //crea una variabile d'ambiente chiamata JWT_SECRET passandogli una chiave segreta usata per firmare i token JWT. Se non esiste nel sistema assegna una stringa vuota.

if (!JWT_SECRET) { //se è vuoto allora l'applicazione si blocca immediatamente lanciando un errore.
    throw new Error("JWT_SECRET deve essere definito");
}

const SALT_ROUNDS = 12; //definisce il costo di hashing per la libreria bcrypt, più questo numero è alto, più tempo ci vorrà per crittografare e verificare la password.

const generateAccessToken = (userId: string): string => {  //creo la harrowfunction chiamandola 
    //generateAccessToken che prende come parametro l'id dell'utente (di tipo stringa) e ritorna una stringa. 
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" }); //All'interno della funzione viene usata la libreria jsonwebtoken per generare un token JWT firmato con la chiave segreta. 
    //Il metodo sign() è uno dei metodi principali delle libreria jsonwebtoken e serve a crare un nuovo tocken crittografato, i parametri in ingresso sono:
    //Il token che contiene l'id dell'utente come payload (ovvero l'oggetto contenente dei dati che vogliamo nascondere dentro il tokent). Equivale a scrivere {userId: userId} dove il valore passato è il parametro della funzione.
    //poi passo la chiave segreta e infine passo un oggetto di configurazione dove passo una scadenza di 5 minuti.
};

const generateRefreshToken = (): string => {
    return crypto.randomBytes(64).toString("hex");
};
//questa funzione genera un refresh token che usa il modulo crypto di Node.js per generare 64 byte di dati casuali e altamente sicuri
//che converte poi tramite .toString("hex") in una stringa esadecimale. 
//Il refresh token viene usato per ottenere un nuovo access token quando quello attuale scade, senza dover richiedere nuovamente le credenziali dell'utente.

const generateTokenPair = async (userId: string) => {
    //è una funzione asincrona che prende come parametro l'id dell'utente (di tipo stringa) e ritorna un oggetto contenente sia l'access token che il refresh token.
    const accessToken = generateAccessToken(userId); //richiama la funzione di prima per generare un Access token
    const refreshToken = generateRefreshToken(); //richiama la funzione di prima per generare un Refresh token
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex"); //non si salva mai il refresh token in chiaro nel database, 
    //o gli hacker potrebbero rubarlo per cui crea un hash di tipo SHA-256 del refresh token. E nel database salvo solo questa password crittografata.
    const expiresAt = new Date(); //crea una variabile temporale expiresAt 
    expiresAt.setDate(expiresAt.getDate() + 7); //e gli setta la data di scadenza a 7 giorni dopo la data attuale (metodo getDate()). Questo significa che il refresh token sarà valido per 7 giorni.
    await refreshTokenRepository.create({
        userId,
        hashToken: refreshTokenHash,
        expiresAt,
        isRevoked: false,
    });
    return { accessToken, refreshToken };
    /*Ritorna:
    {
    accessToken: "0qxgaudbcqdtcygdbga<cgduyx",
    refreshsToken: "jdiaunceqbye"
    }*/
};


export const loginUser = async (email: string, password: string) => {
    try {
        if (!email || !password) {
            return badRequest("Email e password sono richieste");
        }
        const user = await userRepository.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            return forbidden("Email o password non corrette");
        }
        const isPasswordValid = await bcrypt.compare(password, user.hashPassword!);
        if (!isPasswordValid) {
            return forbidden("Email o password non corrette");
        }
        const { accessToken, refreshToken } = await generateTokenPair(user.id);
        const { hashPassword: _, ...userWithoutPassword } = user;
        return success("Accesso effettuato con successo", {
            accessToken,
            refreshToken,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Accesso fallito");
    }
};

export const signUpUser = async (body: SignUpRequestBody) => {
    try {
        const validationError = validateSignUpRequestBody(body);
        if (validationError) {
            return badRequest(validationError);
        }

        const { firstName, lastName, email, password, phoneNumber, birthday } = body;

        //check email 
        const existingUser = await userRepository.findUserByEmail(email.trim().toLowerCase());
        if (existingUser) {
            return badRequest("Questa e-mail esiste già, sceglierne un'altra");
        }

        //check date
        if (birthday) {
            const todayYear = new Date().getFullYear();
            const birthdayYear = new Date(birthday).getFullYear();
            const age = todayYear - birthdayYear;
            if ((age < 12) || (age >= 128)) {
                return badRequest("Devi avere almeno 12 anni e al massimo 128");
            }
        }

        if (phoneNumber && (phoneNumber.trim().length != 13)) {
            return badRequest("Numero di telefono non corretto");
        }

        //hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            hashPassword: passwordHash,
            phoneNumber: phoneNumber?.trim(),
            birthday: birthday,
        }

        const createdUser = await userRepository.create(userData);
        const { refreshToken, accessToken } = await generateTokenPair(createdUser.id);
        return created("Accesso effettuato con successo", {
            user: createdUser,
            refreshToken,
            accessToken
        });
    } catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Accesso fallito");
    }
}

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        if (!refreshToken) {
            return badRequest("Refresh Token mancante");
        }
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const stroredRefreshToken = await refreshTokenRepository.findValidToken(refreshTokenHash);
        if (!stroredRefreshToken) {
            return unauthorized("Token invalido o scaduto");
        }
        const user = await userRepository.findById(stroredRefreshToken.userId);
        if (!user) {
            return unauthorized("Utente non trovato");
        }
        const newAccessToken = generateAccessToken(user.id);
        return success("Access token creato con successo", { newAccessToken });
    }
    catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
};

export const logOutUser = async (refreshToken: string) => {
    try {
        if (!refreshToken) {
            return badRequest("Refresh Token mancante");
        }
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const revokedRefreshToken = await refreshTokenRepository.revokeToken(refreshTokenHash);
        if (!revokedRefreshToken) {
            return badRequest("Refresh token invalido o scaduto");
        }
        return success("Log-out effettuato");
    }
    catch (error) {
        console.log("Errore interno del server", error);
        return internalError("Errore interno del server");
    }
}