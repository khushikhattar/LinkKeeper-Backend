import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();

app.use(
  cors({
    origin: true, // ✅ reflect the request origin (dynamically allow all)
    credentials: true, // ⚠️ must still be careful if using cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
    ], // ✅ all common headers
    exposedHeaders: ["Authorization", "Set-Cookie"], // ✅ expose useful headers
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// ✅ Explicit OPTIONS handler (preflight requests)
app.options("/*", cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", rootRouter);

export { app };
