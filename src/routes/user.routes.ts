import { Router } from "express";
import {
  signUp,
  login,
  logout,
  updateProfile,
  deleteAccount,
  currentUser,
  refreshAccessToken,
} from "../controller/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", signUp);
router.post("/login", login);
router.get("/me", verifyUser, currentUser);
router.post("/logout", verifyUser, logout);
router.patch("/update", verifyUser, updateProfile);
router.post("/refresh", refreshAccessToken);
router.delete("/", verifyUser, deleteAccount);

export default router;
