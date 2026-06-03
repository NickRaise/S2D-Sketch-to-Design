import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { Shape } from "@db/prisma/types";

type CreateShapeInput = {
  clientId: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string | undefined;
  points?: unknown[] | undefined;
  style: Record<string, unknown>;
};

type UpdateShapeInput = {
  id: string;
  x?: number | undefined;
  y?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
  text?: string | undefined;
  // For freestyle shapes, points will be an array of { x: number, y: number }
  points?: unknown[] | undefined;
  style?: Record<string, unknown> | undefined;
};

export const getShapesByFrame = async (frameId: string): Promise<Shape[]> => {
  try {
    return await prisma.shape.findMany({ where: { frameId } });
  } catch (error) {
    console.error("Error fetching shapes:", error);
    throw HttpError.InternalServerError("Error fetching shapes");
  }
};

export const batchUpsertShapes = async (
  frameId: string,
  data: {
    created: CreateShapeInput[];
    updated: UpdateShapeInput[];
    deleted: { id: string }[];
  },
): Promise<{ clientId: string; id: string }[]> => {
  const { created, updated, deleted } = data;
  const createdMappings: { clientId: string; id: string }[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of created) {
        const { clientId, ...shapeData } = item;
        const shape = await tx.shape.create({
          data: {
            frameId,
            type: shapeData.type,
            x: shapeData.x,
            y: shapeData.y,
            width: shapeData.width,
            height: shapeData.height,
            style: shapeData.style as any,
            ...(shapeData.text !== undefined ? { text: shapeData.text } : {}),
            ...(shapeData.points !== undefined
              ? { points: shapeData.points as any }
              : {}),
          },
        });
        createdMappings.push({ clientId, id: shape.id });
      }

      for (const item of updated) {
        const { id, ...updateData } = item;
        await tx.shape.update({
          where: { id },
          data: {
            ...(updateData.x !== undefined ? { x: updateData.x } : {}),
            ...(updateData.y !== undefined ? { y: updateData.y } : {}),
            ...(updateData.width !== undefined
              ? { width: updateData.width }
              : {}),
            ...(updateData.height !== undefined
              ? { height: updateData.height }
              : {}),
            ...(updateData.text !== undefined ? { text: updateData.text } : {}),
            ...(updateData.points !== undefined
              ? { points: updateData.points as any }
              : {}),
            ...(updateData.style !== undefined
              ? { style: updateData.style as any }
              : {}),
          },
        });
      }

      if (deleted.length > 0) {
        await tx.shape.deleteMany({
          where: { id: { in: deleted.map((d) => d.id) } },
        });
      }
    });

    return createdMappings;
  } catch (error) {
    console.error("Error batch upserting shapes:", error);
    throw HttpError.InternalServerError("Error syncing shapes");
  }
};
