export class HttpError extends Error {
  statusCode: number;
  message: string;
  error: string | undefined;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }

  static BadRequest(message: string) {
    return new HttpError(400, message);
  }

  static Unauthorized(message: string) {
    return new HttpError(401, message);
  }

  static Forbidden(message: string) {
    return new HttpError(403, message);
  }

  static NotFound(message: string) {
    return new HttpError(404, message);
  }

  static InternalServerError(message: string, error?: string) {
    return new HttpError(500, message, error);
  }
}
