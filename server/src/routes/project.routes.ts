import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { requireAuth } from "../middlewares/Auth.middleware";
import { requireProjectRole } from "../middlewares/ProjectRole.middleware";
import { validate } from "../middlewares/Validate.middleware";
import { writeLimiter } from "../middlewares/RateLimiter.middleware";
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
router.get("/title/:title", projectController.getByTitle);

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
