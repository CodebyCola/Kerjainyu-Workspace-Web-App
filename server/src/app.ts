import express from "express";
import cors from "cors";
import { generateLimiter } from "./middlewares/RateLimiter.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/Error.middleware";
import authRoutes from "./routes/auth.route";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(generateLimiter);

app.use("/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
