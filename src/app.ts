import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();
app.use(
  cors({
    origin: "https://link-keeper-frontend.vercel.app/",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", rootRouter);

export { app };
