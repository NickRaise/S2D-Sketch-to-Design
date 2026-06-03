import { Request, Response } from "express";
import { AuthenticatedRequest } from "../lib/types/global";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import * as z from "zod";
import {
  getCreditBalanceForUser,
  getCreditLedgerForUser,
} from "../services/billing.service";

export const CheckoutSchema = z.object({
  plan: z.enum(["basic", "pro"]),
});

// TODO: integrate Stripe.checkout.sessions.create
export const createCheckoutHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  validateSchema(req.body, CheckoutSchema);
  throw new HttpError(501, "Stripe checkout not yet implemented");
};

// TODO: verify Stripe-Signature header and handle subscription events
// Note: this route must receive the raw request body for signature verification.
// Mount it before express.json() in server.ts or use express.raw() per-route.
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  res.status(200).json({ received: true });
};

export const getCreditBalanceHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const balance = await getCreditBalanceForUser(req.user.id);
  HttpResponse(res, 200, { balance: balance?.balance ?? 0 });
};

export const getCreditLedgerHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const entries = await getCreditLedgerForUser(req.user.id);
  HttpResponse(res, 200, { entries });
};
