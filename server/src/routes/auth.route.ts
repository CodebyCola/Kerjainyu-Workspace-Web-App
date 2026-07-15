import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/Auth.middleware";
import { authLimiter } from "../middlewares/RateLimiter.middleware";
import { validate } from "../middlewares/Validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();
const authController = new AuthController();
router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  authController.login,
);

router.get("/me", requireAuth, authController.me);
router.post("/logout", authController.logout);

export default router;
