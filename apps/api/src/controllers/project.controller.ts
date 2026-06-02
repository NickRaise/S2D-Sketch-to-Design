import { Response } from "express";
import {
  createProjectForUser,
  deleteProjectById,
  getAllProjectsForUser,
  getProjectById,
  getProjectWithDetails,
  updateProjectById,
  updateProjectPresence,
} from "../services/project.service";
import { HttpError } from "../lib/errors/HttpError";
import {
  HttpResponse,
  stripUndefined,
  validateSchema,
} from "../lib/utils/common";
import * as z from "zod";
import { AuthenticatedRequest } from "../lib/types/global";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const PresenceSchema = z.object({
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  zoom: z.number().optional(),
  activeFrameId: z.string().optional(),
});

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.id;

  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectWithDetails(projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Project not found");
  }

  HttpResponse(res, 200, { message: "Project fetched successfully", project });
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const data = validateSchema(req.body, CreateProjectSchema);
  const typeSafeData = stripUndefined(data);

  const newProject = await createProjectForUser({
    userId: req.user.id,
    ...typeSafeData,
  });

  HttpResponse(res, 201, {
    message: "Project created successfully",
    project: newProject,
  });
};

export const getAllProjects = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const page = Math.max(
    parseInt((req.query.page as string) || "1", 10) || 1,
    1,
  );
  const limit = Math.min(
    Math.max(parseInt((req.query.limit as string) || "10", 10) || 10, 1),
    100,
  );
  const search = req.query.search as string | undefined;

  const { projects, total } = await getAllProjectsForUser(req.user.id, {
    page,
    limit,
    ...(search ? { search } : {}),
  });

  HttpResponse(res, 200, {
    message: "Projects fetched successfully",
    projects,
    pagination: { page, limit, total, hasMore: page * limit < total },
  });
};

export const updateProject = async (
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

  const data = validateSchema(req.body, UpdateProjectSchema);
  const updated = await updateProjectById(projectId, stripUndefined(data));

  HttpResponse(res, 200, {
    message: "Project updated successfully",
    project: updated,
  });
};

export const updatePresence = async (
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

  const data = validateSchema(req.body, PresenceSchema);
  await updateProjectPresence(
    projectId,
    stripUndefined(data) as Record<string, unknown>,
  );

  HttpResponse(res, 200, { message: "Presence updated" });
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

  HttpResponse(res, 200, { message: "Project deleted successfully" });
};
