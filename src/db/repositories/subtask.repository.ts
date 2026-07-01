import { Subtask } from "../../models/Subtask";
import pool from "../db.config";
import { PostgresWrapper } from "../PostgresWrapper";

/*lo schema in un database come postgreSQL è una sorta di cartella che racchiude al suo interno le tabelle, le viste e le funzioni
se si specifica un nome della tabella lo si separa con un punto: nome schema. nome tabella*/

const DB_SCHEMA = process.env.DB_SCHEMA;

class SubtaskRepository extends PostgresWrapper { //la classe subtask repository estende la classe postgreswrapper
    constructor() { //questo è il costruttore della classe
        super(`"${DB_SCHEMA}"."Subtask"`); //il metodo super richiama il costuttore padre e gli passa un valore che è la tabella subtask definita come: nomeSchema.nomeTabella
    }
    async findSubtasksByTask(id: string): Promise<Subtask[]> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE taskId" = $1`;
        /*questa query invoca il metodo della classe padre (dato che non trova il metodo definito nel figlio) che a sua volta richiama una variabile definita nel costruttore padre
        e gli passa il parametro contenuto nella super() del costruttore figlio essendo che la variabile nel metodo del cos(truttore padre è definita come .this 
        e quindi il "this" non si riferisce alla classe in cui è definita la variabile ma al "this" della classe chiamante (quindi il figlio) id*/
        const res = await pool.query(query, [id]); //metodo pool che serve per eseguire una query a partire da un 
        return res.rows;
    }
}

export const subtaskRepository = new SubtaskRepository();