import { Response } from "express";
import { AuthenticatedRequest } from "../lib/types/global";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import * as z from "zod";
import {
  createGenerationJob,
  getGenerationJobById,
  getResultsByProject,
} from "../services/generation.service";
import { getProjectById } from "../services/project.service";

export const GenerateUISchema = z.object({
  frameId: z.string(),
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1),
});

const resolveProject = async (projectId: string, userId: string) => {
  const project = await getProjectById(projectId);
  if (!project || project.userId !== userId) {
    throw HttpError.NotFound("Project not found");
  }
  return project;
};

// TODO: integrate LLM call using project mood board/inspiration images
export const generateStyleGuideHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  await resolveProject(projectId, req.user.id);

  throw new HttpError(501, "Style guide generation not yet implemented");
};

export const generateUIHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  await resolveProject(projectId, req.user.id);

  const { frameId } = validateSchema(req.body, GenerateUISchema);

  // TODO: dispatch job to worker/queue for async LLM processing
  const job = await createGenerationJob(projectId, { frameId });

  HttpResponse(res, 202, { message: "Generation started", jobId: job.id });
};

export const sendChatMessageHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  await resolveProject(projectId, req.user.id);

  const { message } = validateSchema(req.body, ChatMessageSchema);

  // TODO: dispatch chat modification job to worker/queue
  const job = await createGenerationJob(projectId, { message, type: "chat" });

  HttpResponse(res, 200, { message: "AI response generated", jobId: job.id });
};

export const getGenerationJobHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const jobId = req.params.id;
  if (!jobId || typeof jobId !== "string") {
    throw HttpError.BadRequest("Job ID is required");
  }

  const job = await getGenerationJobById(jobId);
  if (!job) throw HttpError.NotFound("Generation job not found");

  const project = await getProjectById(job.projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Generation job not found");
  }

  HttpResponse(res, 200, { job });
};

export const streamGenerationJobHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const jobId = req.params.id;
  if (!jobId || typeof jobId !== "string") {
    throw HttpError.BadRequest("Job ID is required");
  }

  const job = await getGenerationJobById(jobId);
  if (!job) throw HttpError.NotFound("Generation job not found");

  const project = await getProjectById(job.projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Generation job not found");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ status: job.status })}\n\n`);

  // TODO: replace with real-time streaming via pub/sub or DB polling
  res.end();
};

export const getGeneratedResultsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  await resolveProject(projectId, req.user.id);

  const results = await getResultsByProject(projectId);
  HttpResponse(res, 200, { results });
};
