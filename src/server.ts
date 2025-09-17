import dotenv from "dotenv";
import { app } from "./app";
import mongoose from "mongoose";
import serverless from "serverless-http";

dotenv.config();

const startServer = async () => {
  const databaseURL = process.env.MONGODB_URI;
  if (!databaseURL) {
    console.error("Database URL is not defined in environment variables");
    process.exit(1);
  }
  try {
    await mongoose.connect(databaseURL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};
startServer();
export const handler = serverless(app);
