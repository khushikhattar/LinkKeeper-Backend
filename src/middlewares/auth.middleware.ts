import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export interface UserPayload {
  _id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized request" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload;
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(401).json({ message: "Invalid access token" });
    return;
  }
};
