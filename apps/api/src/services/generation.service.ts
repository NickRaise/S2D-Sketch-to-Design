import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { GenerationJob, GeneratedResult } from "@db/prisma/types";

export const createGenerationJob = async (
  projectId: string,
  inputSnapshot: Record<string, unknown>,
  styleGuideId?: string,
): Promise<GenerationJob> => {
  try {
    return await prisma.generationJob.create({
      data: {
        projectId,
        status: "pending",
        inputSnapshot: inputSnapshot as any,
        ...(styleGuideId ? { styleGuideId } : {}),
      },
    });
  } catch (error) {
    console.error("Error creating generation job:", error);
    throw HttpError.InternalServerError("Error creating generation job");
  }
};

export const getGenerationJobById = async (
  jobId: string,
): Promise<GenerationJob | null> => {
  try {
    return await prisma.generationJob.findUnique({ where: { id: jobId } });
  } catch (error) {
    console.error("Error fetching generation job:", error);
    throw HttpError.InternalServerError("Error fetching generation job");
  }
};

export const getResultsByProject = async (
  projectId: string,
): Promise<GeneratedResult[]> => {
  try {
    return await prisma.generatedResult.findMany({
      where: { projectId },
      orderBy: { version: "desc" },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    throw HttpError.InternalServerError("Error fetching generated results");
  }
};
