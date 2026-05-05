import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: NonNullable<Express.Request["user"]>;
};
