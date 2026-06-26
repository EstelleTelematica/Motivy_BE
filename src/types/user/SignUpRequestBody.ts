import Joi from "joi";

export interface SignUpRequestBody {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    phoneNumber?: string; //così sappiamo che phone number è opzionale
    birthday?: Date;
}

export const validateSignUpRequestBody = (data: SignUpRequestBody) => {
    const schema = Joi.object({
        firstName: Joi.string().trim().min(1).max(100).required(),
        lastName: Joi.string().trim().min(1).max(100).required(),
        email: Joi.string().email().trim().required(),
        password: Joi.string().min(8).required(),
        phoneNumber: Joi.string().trim().optional(),
        birthday: Joi.date().optional(),
    });

    const { error } = schema.validate(data, { abortEarly: false });
    if (!error) return null;

    /*per come è definita la libreria joi,
    l'error contiene un array chiamato details 
    dove ogni cella dell'array contiene un oggetto che é una collezione di coppie di tipo chiave: valore.
    es: 
    [
        { path: ['email'], message: '"email" must be a valid email' },
        { path: ['password'], message: '"password" length must be at least 6 characters long' }
    ]
    quindi ogni oggetto contiene due coppie chiave valore dove la prima ci dice l'errore commesso e la seconda 
    il messaggio di errore collegato
  */

    const invalidFields = [...new Set(error.details.map((d) => d.path.join(".")))];
    /*La mappa map() prende tutti gli oggetti del nostro array details generato dalla libreria joi e seleziona per ognuno di queste coppie chiave: valore, solo il valore con chiave path, dato che il messaggio di errore non ci interessa. 
    Il singolo elemento è però contenuto in un array per questo motivo usiamo la join per trasformarlo in stringa e se ci sono più elememnti li uniamo con un punto. La mappa sarà quindi di stile:
    es: ["email", "email", "password"]
    Il set è una collezione che non può avere duplicati e quindi elimina tutti i duplicati della mappa.
    es: Set{"email", "password"}
    Infine 
    Lo Spread Operator [...] ovvero i tre puntini "smontano" il Set e le parentesi quadre ricreano un array standard. Questa variabile finale invalidFields conterrà:
    es: ["email", "password"]
    */

    return `Kindly fix these errors: ${invalidFields.join(", ")}`;
    //Infine il join(".") prende gli elementi dell'array e li unisce inserendo un punto come separatore.
};

