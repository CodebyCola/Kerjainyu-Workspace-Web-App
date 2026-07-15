import express from "express";
import cors from "cors";
import { generateLimiter } from "./middlewares/rateLimiter.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.routes";
import notificationRoutes from "./routes/notification.routes";
import { requireAuth } from "./middlewares/auth.middleware";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(generateLimiter);
app.use(cookieParser()); // kutambahin biar pake http-only cookie

app.use("/auth", authRoutes);
app.use("/projects", requireAuth, projectRoutes);
app.use("/notifications", notificationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
