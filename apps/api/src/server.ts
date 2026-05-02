import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());

app.use("/auth", authRouter);

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    timestamp: Date.now(),
  });
});

app.get("/me", authMiddleware, (req: Request, res: Response) => {
  return res.status(200).json({ data: "This is protected route" });
});

// global error handler
app.use((err: any, req: Request, res: Response) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Api server is running...");
});
