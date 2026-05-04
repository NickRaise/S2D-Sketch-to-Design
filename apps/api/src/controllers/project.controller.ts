import { Response } from "express";
import { getProjectById } from "../services/project.service";
import { HttpError } from "../lib/errors/HttpError";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { HttpResponse } from "../lib/utils/common";
import * as z from "zod";

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.id as string;

  if (!projectId || typeof projectId !== "string") {
    HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user?.id) {
    HttpError.NotFound("Project not found");
  }

  HttpResponse(res, 200, { message: "Project retrieved", project });
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
) => {};
