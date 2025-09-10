import { Router } from "express";
import {
  AddContent,
  DeleteContent,
  MyLink,
  Share,
  ShareLink,
  UserContent,
} from "../controller/content.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const router = Router();
router.post("/add", verifyUser, AddContent);
router.get("/user-content", verifyUser, UserContent);
router.post("/share", verifyUser, Share);
router.delete("/:id", verifyUser, DeleteContent);
router.get("/:hash", ShareLink);
router.get("/my-link", MyLink);
export default router;
