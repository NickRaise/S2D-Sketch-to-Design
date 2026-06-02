import { Response } from "express";
import { AuthenticatedRequest } from "../lib/types/global";
import { HttpError } from "../lib/errors/HttpError";
import {
  HttpResponse,
  stripUndefined,
  validateSchema,
} from "../lib/utils/common";
import * as z from "zod";
import {
  createFrame,
  deleteFrameById,
  getFrameById,
  getFramesByProject,
  updateFrameById,
} from "../services/frame.service";
import { getProjectById } from "../services/project.service";

export const CreateFrameSchema = z.object({
  name: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const UpdateFrameSchema = z.object({
  name: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const createFrameHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.projectId;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Project not found");
  }

  const data = validateSchema(req.body, CreateFrameSchema);
  const frame = await createFrame({ projectId, ...stripUndefined(data) });

  HttpResponse(res, 201, { message: "Frame created successfully", frame });
};

export const getFramesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.projectId;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Project not found");
  }

  const frames = await getFramesByProject(projectId);
  HttpResponse(res, 200, { message: "Frames fetched successfully", frames });
};

export const updateFrameHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const frameId = req.params.id;
  if (!frameId || typeof frameId !== "string") {
    throw HttpError.BadRequest("Frame ID is required");
  }

  const frame = await getFrameById(frameId);
  if (!frame) throw HttpError.NotFound("Frame not found");

  const project = await getProjectById(frame.projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Frame not found");
  }

  const data = validateSchema(req.body, UpdateFrameSchema);
  await updateFrameById(frameId, stripUndefined(data));

  HttpResponse(res, 200, { message: "Frame updated successfully" });
};

export const deleteFrameHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const frameId = req.params.id;
  if (!frameId || typeof frameId !== "string") {
    throw HttpError.BadRequest("Frame ID is required");
  }

  const frame = await getFrameById(frameId);
  if (!frame) throw HttpError.NotFound("Frame not found");

  const project = await getProjectById(frame.projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Frame not found");
  }

  await deleteFrameById(frameId);
  HttpResponse(res, 200, { message: "Frame deleted successfully" });
};
