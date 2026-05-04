import { Router } from "express";
import { asyncHandler } from "../lib/utils/common";
import { googleOAuth, login, logout, refresh, register } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/oauth/google", asyncHandler(googleOAuth));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export const authRouter = router;
