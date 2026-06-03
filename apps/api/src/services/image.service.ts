import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { ProjectImage } from "@db/prisma/types";

export const createProjectImages = async (
  projectId: string,
  images: { url: string; type: "moodBoard" | "inspiration" }[],
): Promise<ProjectImage[]> => {
  try {
    return await prisma.$transaction(
      images.map((img) =>
        prisma.projectImage.create({
          data: { projectId, url: img.url, type: img.type },
        }),
      ),
    );
  } catch (error) {
    console.error("Error creating project images:", error);
    throw HttpError.InternalServerError("Error uploading images");
  }
};

export const getImageById = async (
  imageId: string,
): Promise<ProjectImage | null> => {
  try {
    return await prisma.projectImage.findUnique({ where: { id: imageId } });
  } catch (error) {
    console.error("Error fetching image:", error);
    throw HttpError.InternalServerError("Error fetching image");
  }
};

export const deleteImageById = async (imageId: string): Promise<void> => {
  try {
    await prisma.projectImage.delete({ where: { id: imageId } });
  } catch (error) {
    console.error("Error deleting image:", error);
    throw HttpError.InternalServerError("Error deleting image");
  }
};
