import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { authMiddleware, AuthRequest } from "./middleware/auth.middleware";
import { HttpError } from "./lib/errors/HttpError";
import { HttpResponse } from "./lib/utils/common";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({ status: "ok", timestamp: Date.now() });
});

app.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  return HttpResponse(res, 200, { message: "User retrieved", user: req.user });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });
  }
  console.error("Global error handler:", err);
  return res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
