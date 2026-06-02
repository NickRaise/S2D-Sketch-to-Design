import { RequestHandler, Router } from "express";
import {
  getGenerationJobHandler,
  streamGenerationJobHandler,
} from "../controllers/generation.controller";

const router: Router = Router();

router.get("/:id", getGenerationJobHandler as RequestHandler);
router.get("/:id/stream", streamGenerationJobHandler as RequestHandler);

export const generationJobRouter = router;
