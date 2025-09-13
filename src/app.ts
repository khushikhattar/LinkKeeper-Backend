import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./routes/index.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-keeper-coral.vercel.app",
  // Add any other production domains here
];

// More comprehensive CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      // In production, you might want to be more restrictive
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "Set-Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

// Important: These middleware should come AFTER cors
app.use(express.json());
app.use(cookieParser());

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Handle OPTIONS preflight requests
// Using app.use instead of app.options to avoid pathToRegexp issues
app.use((req: Request, res: Response, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");
    return res.sendStatus(204);
  }
  next();
});

// Your API routes
app.use("/api/v1", rootRouter);

// Error handling middleware for CORS errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy violation" });
  } else {
    next(err);
  }
});

export { app };
