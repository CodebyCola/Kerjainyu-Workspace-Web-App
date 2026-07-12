import { Router } from "express";
import { ProjectLinkController } from "../controllers/project-link.controller";
import { requireProjectRole } from "../middlewares/ProjectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { writeLimiter } from "../middlewares/rateLimiter.middleware";
import { createProjectLinkSchema } from "../schemas/project-link.schema";

const router = Router({ mergeParams: true });
const projectLinkController = new ProjectLinkController();

router.get(
  "/",
  requireProjectRole("leader", "member"),
  projectLinkController.list,
);

router.post(
  "/",
  requireProjectRole("leader", "member"),
  writeLimiter,
  validate({ body: createProjectLinkSchema }),
  projectLinkController.create,
);

router.patch(
  "/:linkId",
  requireProjectRole("leader"),
  validate({ body: createProjectLinkSchema }),
  projectLinkController.update,
);

router.delete(
  "/:linkId",
  requireProjectRole("leader"),
  projectLinkController.remove,
);

export default router;
