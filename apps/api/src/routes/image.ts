import { RequestHandler, Router } from "express";
import { deleteImageHandler } from "../controllers/image.controller";

const router: Router = Router();

router.delete("/:id", deleteImageHandler as RequestHandler);

export const imageRouter = router;
