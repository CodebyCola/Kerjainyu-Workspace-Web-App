import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      res.status(200).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, data: { user: req.user } });
    } catch (err) {
      next(err);
    }
  }
}
