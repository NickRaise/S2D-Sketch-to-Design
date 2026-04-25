import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { User } from "@db/prisma/types";

export const findEmailById = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw HttpError.InternalServerError("Error finding user by email");
  }
};
