import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { Prisma, Project } from "@db/prisma/types";

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

export const getProjectWithDetails = async (projectId: string) => {
  try {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: { styleGuide: true, frames: true, images: true },
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw HttpError.InternalServerError("Error fetching project details");
  }
};

export const createProjectForUser = async (
  data: Prisma.ProjectUncheckedCreateInput,
): Promise<Project> => {
  try {
    return await prisma.project.create({ data });
  } catch (error) {
    console.error("Error creating project:", error);
    throw HttpError.InternalServerError("Error creating project");
  }
};

export const getAllProjectsForUser = async (
  userId: string,
  options: { page: number; limit: number; search?: string },
): Promise<{ projects: Project[]; total: number }> => {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    userId,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);
    return { projects, total };
  } catch (error) {
    console.error("Error fetching projects for user:", error);
    throw HttpError.InternalServerError("Error fetching projects for user");
  }
};

export const updateProjectById = async (
  projectId: string,
  data: {
    name?: string;
    description?: string;
    thumbnail?: string;
    isPublic?: boolean;
  },
): Promise<Project> => {
  try {
    return await prisma.project.update({ where: { id: projectId }, data });
  } catch (error) {
    console.error("Error updating project:", error);
    throw HttpError.InternalServerError("Error updating project");
  }
};

export const updateProjectPresence = async (
  projectId: string,
  presenceData: Record<string, unknown>,
): Promise<void> => {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { viewportData: presenceData as Prisma.InputJsonValue },
    });
  } catch (error) {
    console.error("Error updating project presence:", error);
    throw HttpError.InternalServerError("Error updating project presence");
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
