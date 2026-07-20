import rateLimit from "express-rate-limit";
import { TooManyRequestError } from "../shared/errors";

const handler = (req: any, res: any, next: any) => {
  next(new TooManyRequestError());
};

export const generateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, //  1 min for development
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  // windowMs: 15*60*1000, //15 min for production
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, //only count failed attempts against the limit
  handler,
});

export const writeLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
