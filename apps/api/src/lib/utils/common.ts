import { Request, Response } from "express";

/**
 * Sends a standardized JSON HTTP response with a success flag and data payload.
 * @param req - The Express response object
 * @param statusCode - The HTTP status code to send
 * @param data - The data payload to include in the response
 * @returns A JSON response with a success flag and the provided data
 */
export function HttpResponse(req: Response, statusCode: number, data?: string) {
  return req.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Async handler wrapper for API routes
 * @param fn - The async API route handler function
 */
export async function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      throw new Error("Internal Server Error");
    }
  };
}
