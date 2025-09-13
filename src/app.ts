import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-coral.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send({ message: "Server is healthy" });
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", rootRouter);

export { app };
