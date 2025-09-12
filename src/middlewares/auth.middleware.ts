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
    console.log(req.headers.origin);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Unauthorized Request" });
      return;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload;

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.log("User not found");
      res.status(401).json({ message: "Invalid Access Token" });
      return;
    }

    req.user = user;
    console.log("User attached to request");
    next();
  } catch (error) {
    console.error("Error in verifying the user", error);
    res
      .status(401)
      .json({ message: (error as Error)?.message || "Invalid access token" });
    return;
  }
};
