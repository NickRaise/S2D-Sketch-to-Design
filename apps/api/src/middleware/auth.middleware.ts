import { NextFunction, Request, Response } from "express";
import { parse } from "cookie";
import { HttpError } from "../lib/errors/HttpError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    throw HttpError.Unauthorized("No cookies found");
  }

  const parsedCookies = parse(cookies);
};
