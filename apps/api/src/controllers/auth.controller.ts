import { Request, Response } from "express";
import { createUser, findUserByEmail } from "../services/auth.service";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse } from "../lib/utils/common";
import bcrypt from "bcrypt";
import { User } from "@db/prisma/types";

function extractUserResponseData(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const user = await findUserByEmail(email);

  if (user) {
    throw HttpError.BadRequest("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    name,
    email,
    password: hashedPassword,
    authProvider: "credential",
  });

  HttpResponse(res, 201, {
    message: "User registered successfully",
    user: extractUserResponseData(newUser),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    throw HttpError.BadRequest("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || "");

  if (!isPasswordValid) {
    throw HttpError.BadRequest("Invalid email or password");
  }

  HttpResponse(res, 200, {
    message: "Login successful",
    user: extractUserResponseData(user),
  });
};

export const googleOAuth = async (req: Request, res: Response) => {
  const { email, name, image } = req.body;

  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser({
      name,
      email,
      image,
      authProvider: "google",
    });
  }

  HttpResponse(res, 200, {
    message: "Login successful",
    user: extractUserResponseData(user),
  });
};
