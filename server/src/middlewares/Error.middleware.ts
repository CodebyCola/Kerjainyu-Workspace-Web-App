import { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors";
import { env } from "../config/env";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // Unexpected error — log full detail server-side, hide internals from client
  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: "Something went wrong",
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}

// Catches routes that don't exist at all (mount right before errorMiddleware)
export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
