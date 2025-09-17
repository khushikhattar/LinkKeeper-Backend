import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const databaseURL = process.env.MONGODB_URI;

if (!databaseURL) {
  throw new Error("Database URL is not defined in environment variables");
}

mongoose
  .connect(databaseURL)
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB", err));

export default app;
