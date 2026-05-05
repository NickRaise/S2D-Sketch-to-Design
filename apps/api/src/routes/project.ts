import { RequestHandler, Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProject,
} from "../controllers/project.controller";

const router: Router = Router();

router.get("/:id", getProject as RequestHandler);
router.get("/", getAllProjects as RequestHandler);
router.post("/", createProject as RequestHandler);
router.delete("/:id", deleteProject as RequestHandler);

export const projectRouter = router;
