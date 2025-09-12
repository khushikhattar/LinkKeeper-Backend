import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-frontend.vercel.app",
];
console.log("Hello");
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
};
console.log("Hello");
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(cookieParser());
console.log("Hello");
app.use("/api/v1", rootRouter);

export { app };
