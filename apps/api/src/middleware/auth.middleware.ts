import { NextFunction, Request, Response } from "express";
import { parse } from "cookie";
import { HttpError } from "../lib/errors/HttpError";
import { getToken, JWT } from "next-auth/jwt";

const NEXT_AUTH_SECRET = process.env.NEXTAUTH!;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | undefined;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = await getTokenFromRequest(req);

  if (!token) {
    throw new HttpError(401, "Unauthorized: No token provided");
  }

  if (!token.email || !token.userId) {
    throw new HttpError(401, "Unauthorized: Invalid token");
  }

  req.user = {
    id: token.userId,
    email: token.email,
    name: token.name,
  };

  next();
};

const getTokenFromRequest = async (req: AuthRequest): Promise<JWT | null> => {
  try {
    const token = await getToken({ req, secret: NEXT_AUTH_SECRET });
    return token;
  } catch (error) {
    console.error("Error extracting token from request:", error);
    return null;
  }
};
