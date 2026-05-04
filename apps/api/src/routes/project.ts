import { Router } from "express";
import { createProject, getProject } from "../controllers/project.controller";

const router: Router = Router();

router.get("/:id", getProject);
router.post("/", createProject);

export const projectRouter = router;
