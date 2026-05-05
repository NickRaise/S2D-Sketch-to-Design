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

export const createProjectForUser = async (
  userId: string,
  name: string,
  description: string | undefined,
): Promise<Project> => {
  try {
    return await prisma.project.create({
      data: {
        userId,
        name,
        description: description || null,
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    throw HttpError.InternalServerError("Error creating project");
  }
};

export const getAllProjectsForUser = async (
  userId: string,
): Promise<Project[]> => {
  try {
    return await prisma.project.findMany({ where: { userId } });
  } catch (error) {
    console.error("Error fetching projects for user:", error);
    throw HttpError.InternalServerError("Error fetching projects for user");
  }
};

export const deleteProjectById = async (projectId: string): Promise<void> => {
  try {
    await prisma.project.delete({ where: { id: projectId } });
  } catch (error) {
    console.error("Error deleting project:", error);
    throw HttpError.InternalServerError("Error deleting project");
  }
};
