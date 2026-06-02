import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { Frame, Prisma } from "@db/prisma/types";

export const createFrame = async (
  data: Prisma.FrameUncheckedCreateInput,
): Promise<Frame> => {
  try {
    return await prisma.frame.create({ data });
  } catch (error) {
    console.error("Error creating frame:", error);
    throw HttpError.InternalServerError("Error creating frame");
  }
};

export const getFramesByProject = async (
  projectId: string,
): Promise<Frame[]> => {
  try {
    return await prisma.frame.findMany({ where: { projectId } });
  } catch (error) {
    console.error("Error fetching frames:", error);
    throw HttpError.InternalServerError("Error fetching frames");
  }
};

export const getFrameById = async (frameId: string): Promise<Frame | null> => {
  try {
    return await prisma.frame.findUnique({ where: { id: frameId } });
  } catch (error) {
    console.error("Error fetching frame:", error);
    throw HttpError.InternalServerError("Error fetching frame");
  }
};

export const updateFrameById = async (
  frameId: string,
  data: {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  },
): Promise<Frame> => {
  try {
    return await prisma.frame.update({ where: { id: frameId }, data });
  } catch (error) {
    console.error("Error updating frame:", error);
    throw HttpError.InternalServerError("Error updating frame");
  }
};

export const deleteFrameById = async (frameId: string): Promise<void> => {
  try {
    await prisma.frame.delete({ where: { id: frameId } });
  } catch (error) {
    console.error("Error deleting frame:", error);
    throw HttpError.InternalServerError("Error deleting frame");
  }
};
