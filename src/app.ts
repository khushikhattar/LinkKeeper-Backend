import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-frontend.vercel.app",
];

app.use(express.json());
app.use(cookieParser());

// ✅ Apply CORS only to /api/v1 routes (no "*" or "/*")
app.use(
  "/api/v1",
  cors({
    origin: allowedOrigins, // safer than true if using cookies
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
    ],
    exposedHeaders: ["Authorization", "Set-Cookie"],
    optionsSuccessStatus: 204,
  }),
  rootRouter
);

export { app };
