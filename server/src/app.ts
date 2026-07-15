import express from "express";
import cors from "cors";
import { generateLimiter } from "./middlewares/rateLimiter.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/Error.middleware";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.routes";
import { requireAuth } from "./middlewares/Auth.middleware";
import cookieParser from "cookie-parser";


export const app = express();

app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}));
app.use(express.json());
app.use(generateLimiter);
app.use(cookieParser()); // kutambahin biar pake http-only cookie

app.use("/auth", authRoutes);
app.use("/projects", requireAuth, projectRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
