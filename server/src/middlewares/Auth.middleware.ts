import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/jwt";
import { UnauthorizedError } from "../shared/errors";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or malformed Authorization header"),
    );
  }
  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(header.slice("Bearer ".length));
    } catch (err) {
      next(err);
    }
  }
}
