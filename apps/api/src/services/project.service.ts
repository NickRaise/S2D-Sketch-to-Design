import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { Project } from "@db/prisma/types";

export const getProjectById = async (
  projectId: string,
): Promise<Project | null> => {
  try {
    return await prisma.project.findUnique({ where: { id: projectId } });
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw HttpError.InternalServerError("Error fetching project by ID");
  }
};
