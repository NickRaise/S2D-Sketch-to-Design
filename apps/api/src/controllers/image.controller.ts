import { Response } from "express";
import { AuthenticatedRequest } from "../lib/types/global";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import * as z from "zod";
import {
  createProjectImages,
  deleteImageById,
  getImageById,
} from "../services/image.service";
import { getProjectById } from "../services/project.service";

// TODO: replace with multipart/form-data handling via multer for real file uploads.
// Caller should upload files to cloud storage first and provide the resulting URLs here.
export const UploadImagesSchema = z.object({
  images: z.array(z.object({ url: z.url() })).min(1),
  type: z.enum(["moodBoard", "inspiration"]),
});

export const uploadImagesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const projectId = req.params.id;
  if (!projectId || typeof projectId !== "string") {
    throw HttpError.BadRequest("Project ID is required");
  }

  const project = await getProjectById(projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Project not found");
  }

  const { images, type } = validateSchema(req.body, UploadImagesSchema);

  const created = await createProjectImages(
    projectId,
    images.map((img) => ({ url: img.url, type })),
  );

  HttpResponse(res, 201, {
    message: "Images uploaded successfully",
    images: created,
  });
};

export const deleteImageHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const imageId = req.params.id;
  if (!imageId || typeof imageId !== "string") {
    throw HttpError.BadRequest("Image ID is required");
  }

  const image = await getImageById(imageId);
  if (!image) throw HttpError.NotFound("Image not found");

  const project = await getProjectById(image.projectId);
  if (!project || project.userId !== req.user.id) {
    throw HttpError.NotFound("Image not found");
  }

  await deleteImageById(imageId);
  HttpResponse(res, 200, { message: "Image deleted successfully" });
};
