import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { writeLimiter } from "../middlewares/rateLimiter.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema";

const router = Router();
const projectController = new ProjectController();

router.use(requireAuth);

router.post(
  "/",
  writeLimiter,
  validate({ body: createProjectSchema }),
  projectController.create,
);

router.get("/", projectController.list);
router.get("/:projectId", projectController.getById);

router.patch(
  "/:projectId",
  requireProjectRole("leader"),
  validate({ body: updateProjectSchema }),
  projectController.update,
);

router.post(
  "/:projectId/archive",
  requireProjectRole("leader"),
  projectController.archive,
);

router.delete(
  "/:projectId",
  requireProjectRole("leader"),
  projectController.remove,
);

export default router;
