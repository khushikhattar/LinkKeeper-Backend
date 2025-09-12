import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";
const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-frontend.vercel.app",
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use("/api/v1", rootRouter);
export { app };
