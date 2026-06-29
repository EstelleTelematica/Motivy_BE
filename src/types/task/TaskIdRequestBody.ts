import Joi from "joi";

export const validateTaskId = (id: string) => {
    const schema = Joi.string().guid({ version: 'uuidv4' }).required();

    // Validiamo direttamente la stringa id 
    const { error } = schema.validate(id);

    if (!error) return null;

    // Se c'è un errore di validazione
    return "Invalid Task ID format. Must be a valid UUIDv4";
};
