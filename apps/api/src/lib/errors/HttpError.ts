export class HttpError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
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

  static InternalServerError(message: string) {
    return new HttpError(500, message);
  }
}
