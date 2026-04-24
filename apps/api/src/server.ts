import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authRouter } from "./routes/auth";

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Api server is running...");
});
