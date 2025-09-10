import { Router } from "express";
import {
  AddTagsToContent,
  deleteTags,
  searchContent,
  AddTag,
} from "../controller/tags.controller";
import { verifyUser } from "../middlewares/auth.middleware";
const router = Router();
router.post("/add", verifyUser, AddTag);
router.post("/content/tags", verifyUser, AddTagsToContent);
router.get("/content/search", searchContent);
router.delete("/content/:contentId/tags/:tagId", verifyUser, deleteTags);
export default router;
