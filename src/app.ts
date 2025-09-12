import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();
const allowedOrigins = [
  "https://link-keeper-frontend.vercel.app/",
  "http://localhost:5173/", // for local dev (Vite default)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", rootRouter);

export { app };
