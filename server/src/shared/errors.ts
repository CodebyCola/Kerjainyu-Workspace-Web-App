export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized User") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, "Validation Failed", details);
  }
}

export class TooManyRequestError extends AppError {
  constructor(message = "Too many request, ply try again soon") {
    super(429, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict with the current data") {
    super(409, message);
  }
}
