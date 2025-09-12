import z from "zod";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.genAccessToken();
    const refreshToken = user.genRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Error generating tokens: ${(error as Error).message}`);
  }
};
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  } as const;
};

const signupSchema = z
  .object({
    name: z.string(),
    username: z.string().min(8, "Username must be of minimum 8 length"),
    email: z.email(),
    password: z.string().min(8, "Password must be of minimum 8 length"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type signupData = z.infer<typeof signupSchema>;

const signUp = async (req: Request, res: Response) => {
  try {
    const parsedResult = signupSchema.safeParse(req.body);
    if (!parsedResult.success) {
      res.status(400).json({
        message: "Validation errors",
        errors: parsedResult.error.issues,
      });
      return;
    }
    const data: signupData = parsedResult.data;
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
    if (!createUser) {
      res.status(400).json({ message: "Error in creating the user" });
      return;
    }
    res
      .status(201)
      .json({ message: "User registered successfully", createUser });
  } catch (error) {
    console.error("Registeration error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

type loginData = z.infer<typeof loginSchema>;

const login = async (req: Request, res: Response) => {
  try {
    const parsedResult = loginSchema.safeParse(req.body);
    if (!parsedResult.success) {
      res.status(400).json({ message: parsedResult.error.issues });
      return;
    }
    const data: loginData = parsedResult.data;

    const existedUser = await User.findOne({
      $or: [{ username: data.identifier }, { email: data.identifier }],
    });
    if (!existedUser) {
      res.status(401).json({ message: "User does not exists" });
      return;
    }

    const ispasswordValid = await existedUser.isPasswordCorrect(data.password);
    if (!ispasswordValid) {
      res.status(401).json({ message: "Invalid Password" });
      return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existedUser._id
    );

    const loginUser = await User.findById(existedUser._id).select(
      "-refreshToken -password"
    );
    if (!loginUser) {
      res.status(400).json({ message: "Error logging the user" });
      return;
    }

    const options = getCookieOptions();
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User logged in successfully",
        user: loginUser,
        token: accessToken,
      });
  } catch (err) {
    console.error("Login Error", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const logout = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json("Unauthorised Request");
    return;
  }
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true, timestamps: false }
    );

    const options = getCookieOptions();
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out user" });
    return;
  }
};

const currentUser = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorised Request" });
    return;
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json({ user });
};

const updateSchema = z.object({
  name: z.string().optional(),
  username: z
    .string()
    .min(8, "Username must be of minimum 8 length")
    .optional(),
  email: z.email().optional(),
});
type updateData = z.infer<typeof updateSchema>;

const updateProfile = async (req: Request, res: Response) => {
  const parsedResult = updateSchema.safeParse(req.body);
  if (!parsedResult.success) {
    res.status(400).json({ message: parsedResult.error.issues });
    return;
  }
  const updateData: updateData = parsedResult.data;

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

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
  } catch (error) {
    console.log("Updation Error:", error);
    res.status(500).json({ message: "Error updating profile" });
    return;
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "Unauthorised Request" });
      return;
    }
    const deleteUser = await User.findByIdAndDelete(req.user._id);
    if (!deleteUser) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.log("Deletion Error:", error);
    res.status(500).json({ message: "Error deleting account" });
    return;
  }
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }
  const user = await User.findOne({
    refreshToken: oldRefreshToken,
  });
  if (!user) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }

  try {
    const token = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    if (token._id !== user._id.toString()) {
      console.log(token._id);
      console.log(user._id.toString());
      res.status(401).json({ message: "Token user ID does not match" });
      return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const options = getCookieOptions();
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "Access token refreshed successfully" });
  } catch (error) {
    res.status(401).json({
      message: "Invalid refresh token",
      error: (error as Error).message,
    });
    return;
  }
};

export {
  signUp,
  login,
  logout,
  deleteAccount,
  updateProfile,
  currentUser,
  refreshAccessToken,
};
