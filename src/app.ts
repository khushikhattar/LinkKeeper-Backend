import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const allowedOrigins = [
  "https://link-keeper-frontend.vercel.app",
  "http://localhost:5173",
];
const previewRegex = /\.vercel\.app$/;
const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || previewRegex.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

export { app };
