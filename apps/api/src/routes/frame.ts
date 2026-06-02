import { RequestHandler, Router } from "express";
import {
  updateFrameHandler,
  deleteFrameHandler,
} from "../controllers/frame.controller";
import {
  batchUpsertShapesHandler,
  getShapesHandler,
} from "../controllers/shape.controller";

const router: Router = Router();

router.patch("/:id", updateFrameHandler as RequestHandler);
router.delete("/:id", deleteFrameHandler as RequestHandler);
router.post(
  "/:frameId/shapes/batch",
  batchUpsertShapesHandler as RequestHandler,
);
router.get("/:frameId/shapes", getShapesHandler as RequestHandler);

export const frameRouter = router;
