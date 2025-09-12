import userRouter from "./user.routes";
import tagRouter from "./tag.routes";
import contentRouter from "./content.routes";
import { Router, Request, Response } from "express";
const router = Router();
router.get("/health", (req: Request, res: Response) => {
  res.send({ message: "Server is healthy" });
});
router.use("/users", userRouter);
router.use("/tags", tagRouter);
router.use("/content", contentRouter);

export default router;
