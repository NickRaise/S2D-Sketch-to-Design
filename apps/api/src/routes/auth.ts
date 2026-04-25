import { Request, Response, Router } from "express";
import { asyncHandler } from "../lib/utils/common";
import { login, register } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/register", asyncHandler(register));

router.post("/login", asyncHandler(login));

export const authRouter = router;
