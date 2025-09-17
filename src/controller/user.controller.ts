import z from "zod";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

// Helper to generate access & refresh tokens
const generateAccessAndRefreshTokens = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const accessToken = user.genAccessToken();
  const refreshToken = user.genRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ---------------- SIGNUP ----------------
const signupSchema = z
  .object({
    name: z.string(),
    username: z.string().min(8),
    email: z.email(),
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type signupData = z.infer<typeof signupSchema>;

const signUp = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation errors", errors: parsed.error.issues });
      return;
    }
    const data: signupData = parsed.data;

    const existedUser = await User.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
    if (existedUser) {
      res
        .status(409)
        .json({ message: "User already exists with username or email" });
      return;
    }

    const createUser = await User.create({
      username: data.username,
      name: data.name,
      email: data.email,
      password: data.password,
      refreshToken: "",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: createUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

// ---------------- LOGIN ----------------
const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

type loginData = z.infer<typeof loginSchema>;

const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues });
      return;
    }

    const data: loginData = parsed.data;
    const existedUser = await User.findOne({
      $or: [{ username: data.identifier }, { email: data.identifier }],
    });
    if (!existedUser) {
      res.status(401).json({ message: "User does not exist" });
      return;
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(data.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existedUser._id
    );
    const user = await User.findById(existedUser._id).select(
      "-refreshToken -password"
    );

    res.status(200).json({
      message: "User logged in successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

// ---------------- LOGOUT ----------------
const logout = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }

  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error logging out user" });
    return;
  }
};

// ---------------- CURRENT USER ----------------
const currentUser = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }

  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user });
};

// ---------------- UPDATE PROFILE ----------------
const updateSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(8).optional(),
  email: z.email().optional(),
});
type updateData = z.infer<typeof updateSchema>;

const updateProfile = async (req: Request, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues });
    return;
  }

  if (!req.user?._id) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }

  const updateData: updateData = parsed.data;
  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ message: "No fields provided to update" });
    return;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating profile" });
    return;
  }
};

// ---------------- DELETE ACCOUNT ----------------
const deleteAccount = async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).json({ message: "Error deleting account" });
    return;
  }
};

// ---------------- REFRESH ACCESS TOKEN ----------------
const refreshAccessToken = async (req: Request, res: Response) => {
  const oldRefreshToken = req.body.refreshToken;
  if (!oldRefreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  const user = await User.findOne({ refreshToken: oldRefreshToken });
  if (!user) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }

  try {
    const tokenPayload = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as {
      _id: string;
    };

    if (tokenPayload._id !== user._id.toString()) {
      res.status(401).json({ message: "Token user ID does not match" });
      return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(401).json({
      message: "Invalid refresh token",
      error: (err as Error).message,
    });
    return;
  }
};

export {
  signUp,
  login,
  logout,
  currentUser,
  updateProfile,
  deleteAccount,
  refreshAccessToken,
};
