import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors/HttpError";
import { verifyAccessToken, TokenPayload } from "../lib/utils/tokens";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    throw new HttpError(401, "Unauthorized: No token provided");
  }

  let payload: TokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, "Unauthorized: Invalid or expired token");
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };

  next();
};
