import dotenv from "dotenv";
dotenv.config();
import express, { RequestHandler } from "express";
import cors from "cors";
import pool from "./db/db.config";
import authRouter from "./routers/auth.router";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
};

app.use(express.json()); //express interpreta i dati della route in json

app.use("/auth", authRouter);
//app.use("/tasks", taskRouter);
//app.use("/subtasks", subtaskRouter);
app.use("*", notFoundHandler); //richiamo tutte le route per controllare se si aproo correttamente o restituisco errore

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Successfully connected to PostgreSQL at:", res.rows[0].now);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
})();
