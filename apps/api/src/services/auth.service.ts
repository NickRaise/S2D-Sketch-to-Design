import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { AuthProvider, User } from "@db/prisma/types";

interface ICreateUserData {
  name: string;
  email: string;
  image?: string | null;
  password?: string | null;
  authProvider: AuthProvider;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw HttpError.InternalServerError("Error finding user by email");
  }
};

export const findUserById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw HttpError.InternalServerError("Error finding user by id");
  }
};

export const createUser = async (data: ICreateUserData): Promise<User> => {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    console.error("Error creating user:", error);
    throw HttpError.InternalServerError("Error creating user");
  }
};
