import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
};
app.use(cors(corsOptions));
app.options("/api/v1/*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", rootRouter);

export { app };
