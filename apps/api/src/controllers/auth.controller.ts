import { Request, Response } from "express";
import { findEmailById } from "../services/auth.service";
import { HttpError } from "../lib/errors/HttpError";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // if email in db throw error
  const user = await findEmailById(email);

  if (user) {
    throw HttpError.BadRequest("Email already exists");
  }

  // hash password

  // save user to db

  // set the token in cookie

  // send success response
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // find user by email

  // if user not found throw error

  // compare password

  // throw error if password does not match

  // set the token in cookie

  // send success response
};
