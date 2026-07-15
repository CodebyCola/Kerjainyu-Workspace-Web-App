import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.register(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, data: req.user });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
