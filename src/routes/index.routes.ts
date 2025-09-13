import userRouter from "./user.routes";
import tagRouter from "./tag.routes";
import contentRouter from "./content.routes";
import { Router } from "express";
const router = Router();
router.use("/users", userRouter);
router.use("/tags", tagRouter);
router.use("/content", contentRouter);

export default router;
