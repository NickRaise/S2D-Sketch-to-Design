import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors/HttpError";
import { verifyAccessToken, TokenPayload } from "../lib/utils/tokens";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
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
