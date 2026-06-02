import { RequestHandler, Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProject,
  updateProject,
  updatePresence,
} from "../controllers/project.controller";
import {
  createFrameHandler,
  getFramesHandler,
} from "../controllers/frame.controller";
import { uploadImagesHandler } from "../controllers/image.controller";
import {
  generateStyleGuideHandler,
  generateUIHandler,
  sendChatMessageHandler,
  getGeneratedResultsHandler,
} from "../controllers/generation.controller";

const router: Router = Router();

router.get("/", getAllProjects as RequestHandler);
router.post("/", createProject as RequestHandler);
router.get("/:id", getProject as RequestHandler);
router.patch("/:id", updateProject as RequestHandler);
router.delete("/:id", deleteProject as RequestHandler);
router.patch("/:id/presence", updatePresence as RequestHandler);

router.post("/:projectId/frames", createFrameHandler as RequestHandler);
router.get("/:projectId/frames", getFramesHandler as RequestHandler);

router.post("/:id/images", uploadImagesHandler as RequestHandler);

router.post(
  "/:id/style-guide/generate",
  generateStyleGuideHandler as RequestHandler,
);
router.post("/:id/generate", generateUIHandler as RequestHandler);
router.post("/:id/chat", sendChatMessageHandler as RequestHandler);
router.get("/:id/results", getGeneratedResultsHandler as RequestHandler);

export const projectRouter = router;
