import express from "express";
import cors from "cors";
import rootRouter from "./routes/index.routes";
import { loggingMiddleware } from "./middlewares/logging.middleware";

const app = express();
app.use(cors());

app.use(express.json());
app.use(loggingMiddleware);
app.use("/api/v1", rootRouter);

export default app;
