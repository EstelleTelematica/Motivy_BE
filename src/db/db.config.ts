import { Pool } from "pg"; //libreria standard di Node.js per interagire con PostgreSQL. da cui importiamo Pool.
import dotenv from "dotenv"; //libreria che serve a leggere il file env (dot sta per punto quindi dotenv significa .env)

//questo file serve a configurare e inizializzare la connessione al database PostgreSQL all'interno dell'applicazione Node.js.

dotenv.config();
//Questa riga dice a Node.js di andare a cercare un file chiamato .env nella root del progetto e di prendere tutte le variabili 
//scritte lì dentro e caricarle in process.env. così facendo quelle chiavi restano segrete

const pool = new Pool({ //creo l'istanza della classe reale Pool (richiamo il costruttore) che serve a tenere sempre aperte delle connessioni con il database
  connectionString: process.env.POSTGRESQL_URL, //l'indirizzo del mio database viene preso dal mio fil env dove è scritto nella variabile POSTGRESQL_URL
  ssl: { //serve per cifrare (node.js contatta il database per dirgli che vuole condividere le informazioni nei pacchetti in maniera sicura tramite SSL)
    rejectUnauthorized: false, //dice di ignorare il fatto che questo certificato non sia firmato da un'autorità pubblica che conosce e di non bloccare l'applicazione (non connettendosi al database)
  },
});

export default pool; //esporto il metodo