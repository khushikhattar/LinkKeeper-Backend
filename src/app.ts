import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  console.log("Request:", req.method, req.path, "Origin:", req.headers.origin);
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", rootRouter);

export { app };
