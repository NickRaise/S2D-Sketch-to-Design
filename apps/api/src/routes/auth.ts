import { Router } from "express";
import { asyncHandler, validateSchema } from "../lib/utils/common";
import {
  googleOAuth,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller";
import * as z from "zod";

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const GoogleOAuthSchema = z.object({
  accessToken: z.string(),
});

const router: Router = Router();

router.post(
  "/register",
  validateSchema(RegisterSchema),
  asyncHandler(register),
);
router.post("/login", validateSchema(LoginSchema), asyncHandler(login));
router.post(
  "/oauth/google",
  validateSchema(GoogleOAuthSchema),
  asyncHandler(googleOAuth),
);
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export const authRouter = router;
