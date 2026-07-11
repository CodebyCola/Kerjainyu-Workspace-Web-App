import { NextFunction, Request, Response } from "express";
import { db } from "../database";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";
import { ProjectRole } from "../database/types";

export function requireProjectRole(...allowedRoles: ProjectRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const projectId = Number(req.params.projectId);

    if (!projectId || Number.isNaN(projectId)) {
      return next(new ForbiddenError("Missing or invalid project id in route"));
    }

    const membership = await db
      .selectFrom("project_members")
      .where("project_id", "=", projectId)
      .where("user_id", "=", req.user.userId)
      .where("status", "=", "active")
      .select(["role"])
      .executeTakeFirst();

    if (!membership) {
      return next(new ForbiddenError("You are not a member of this project"));
    }

    if (!allowedRoles.includes(membership.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of: ${allowedRoles.join(", ")}`,
        ),
      );
    }

    // Stash it in case the controller wants it (avoids a second query)
    (req as any).projectRole = membership.role;

    next();
  };
}
