import { Request, Response } from "express";
import {
  createProjectForUser,
  deleteProjectById,
  getAllProjectsForUser,
  getProjectById,
} from "../services/project.service";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import * as z from "zod";
import { AuthenticatedRequest } from "../lib/types/global";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.id;

  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user.id) {
    HttpError.NotFound("Project not found");
  }

  HttpResponse(res, 200, { message: "Project retrieved", project });
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { name, description } = validateSchema(req.body, CreateProjectSchema);

  const newProject = await createProjectForUser(req.user.id, name, description);

  HttpResponse(res, 201, { message: "Project created", project: newProject });
};

export const getAllProjects = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projects = await getAllProjectsForUser(req.user.id);

  HttpResponse(res, 200, { message: "Projects retrieved", projects });
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;

  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Project not found");
  }

  await deleteProjectById(projectId);

  HttpResponse(res, 200, { message: "Project deleted" });
}