import dotenv from "dotenv";
dotenv.config();
import express, { RequestHandler } from "express";
import cors from "cors";
import pool from "./db/db.config";
import authRouter from "./routers/auth.router";
import taskRouter from "./routers/task.router";
import { decode } from "./middlewares/decode";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Non esiste l'enpoint API",
  });
};

app.use(express.json()); //express interpreta i dati della route in json

app.use("/auth", authRouter);
app.use("/tasks", decode, taskRouter);
app.use("*", notFoundHandler); //richiamo tutte le route per controllare se si aprono correttamente o restituisco un errore

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connesso correttamente a PostgreSQL alla riga:", res.rows[0].now);
    app.listen(PORT, () => {
      console.log(`Server funziona alla porta: ${PORT}`);
    });
  } catch (err) {
    console.error("Fallito nel connettersi a PostgreSQL:", err);
    process.exit(1);
  }
})();
