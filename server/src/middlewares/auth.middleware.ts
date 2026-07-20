import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/jwt";
import { UnauthorizedError } from "../shared/errors";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return next(
      new UnauthorizedError("Missing or malformed Authorization token"),
    );
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
