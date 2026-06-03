import { RequestHandler, Router } from "express";
import {
  createCheckoutHandler,
  getCreditBalanceHandler,
  getCreditLedgerHandler,
} from "../controllers/billing.controller";

const router: Router = Router();

router.post("/checkout", createCheckoutHandler as RequestHandler);
router.get("/credits", getCreditBalanceHandler as RequestHandler);
router.get("/credits/history", getCreditLedgerHandler as RequestHandler);

export const billingRouter = router;
