import { Response } from "express";
import { AuthenticatedRequest } from "../lib/types/global";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import * as z from "zod";
import { batchUpsertShapes, getShapesByFrame } from "../services/shape.service";
import { getFrameById } from "../services/frame.service";
import { getProjectById } from "../services/project.service";

const ShapeStyleSchema = z.record(z.string(), z.unknown());

const CreateShapeSchema = z.object({
  clientId: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string().optional(),
  points: z.array(z.unknown()).optional(),
  style: ShapeStyleSchema,
});

const UpdateShapeSchema = z.object({
  id: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  text: z.string().optional(),
  points: z.array(z.unknown()).optional(),
  style: ShapeStyleSchema.optional(),
});

const DeleteShapeSchema = z.object({
  id: z.string(),
});

export const BatchUpsertSchema = z.object({
  created: z.array(CreateShapeSchema).default([]),
  updated: z.array(UpdateShapeSchema).default([]),
  deleted: z.array(DeleteShapeSchema).default([]),
});

const resolveFrame = async (frameId: string, userId: string) => {
  const frame = await getFrameById(frameId);
  if (!frame) throw HttpError.NotFound("Frame not found");

  const project = await getProjectById(frame.projectId);
  if (!project || project.userId !== userId)
    throw HttpError.NotFound("Frame not found");

  return frame;
};

export const batchUpsertShapesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const frameId = req.params.frameId;
  if (!frameId || typeof frameId !== "string") {
    throw HttpError.BadRequest("Frame ID is required");
  }

  await resolveFrame(frameId, req.user.id);

  const data = validateSchema(req.body, BatchUpsertSchema);
  const createdMappings = await batchUpsertShapes(frameId, data);

  HttpResponse(res, 200, {
    message: "Shapes synced successfully",
    createdMappings,
  });
};

export const getShapesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const frameId = req.params.frameId;
  if (!frameId || typeof frameId !== "string") {
    throw HttpError.BadRequest("Frame ID is required");
  }

  await resolveFrame(frameId, req.user.id);

  const shapes = await getShapesByFrame(frameId);
  HttpResponse(res, 200, { message: "Shapes fetched successfully", shapes });
};
