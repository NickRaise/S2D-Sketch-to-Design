import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/utils/common";
import { googleOAuth, login, register } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/register", asyncHandler(register));

router.post("/login", asyncHandler(login));

router.post("/oauth/google", asyncHandler(googleOAuth));

export const authRouter = router;
