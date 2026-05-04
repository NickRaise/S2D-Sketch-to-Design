import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";
import * as z from "zod";

/**
 * Sends a standardized JSON HTTP response with a success flag and data payload.
 * @param req - The Express response object
 * @param statusCode - The HTTP status code to send
 * @param data - The data payload to include in the response
 * @returns A JSON response with a success flag and the provided data
 */
export function HttpResponse(
  req: Response,
  statusCode: number,
  data: Record<string, any>,
) {
  return req.status(statusCode).json({
    success: true,
    ...data,
  });
}

/**
 * Async handler wrapper for API routes
 * @param fn - The async API route handler function
 */
export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<any>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate request body against a Zod schema
 * @param schema - The Zod schema to validate against
 */
export function validateSchema<T>(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw HttpError.BadRequest("Invalid request data");
      }
      console.error("Zod validation error:", error);
      throw HttpError.InternalServerError("Server error during zod validation");
    }
  };
}
