import express from "express";
import cors from "cors";
import rootRouter from "./routes/index.routes";
import { loggingMiddleware } from "./middlewares/logging.middleware";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-frontend.vercel.app",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.json());
app.use(loggingMiddleware);
app.use("/api/v1", rootRouter);

export default app;
