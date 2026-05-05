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
 * Validates data against a Zod schema and throws an HttpError if validation fails.
 * @param data - The data to validate
 * @param schema - The Zod schema to validate against
 * @returns The validated data if validation succeeds
 * @throws HttpError with status 400 if validation fails, or 500 for unexpected errors
 */
export function validateSchema<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map((err) => {
          const field = err.path.join(".");
          return field ? `${field}: ${err.message}` : err.message;
        })
        .join(", ");
      throw HttpError.BadRequest(message);
    }
    console.error("Zod validation error:", error);
    throw HttpError.InternalServerError("Server error during zod validation");
  }
}
