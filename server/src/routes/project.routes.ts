import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { TaskSubmissionController } from "../controllers/task-submission.controller";
import { TaskAppealController } from "../controllers/task-appeal.controller";
import { TaskOwnershipLogController } from "../controllers/task-ownership-log.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { writeLimiter } from "../middlewares/rateLimiter.middleware";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema";
import projectMemberRoutes from "./project-member.routes";
import projectLinkRoutes from "./project-link.routes";
import taskRoutes from "./task.routes";
import taskSwapRequestRoutes from "./task-swap-request.routes";

const router = Router();
const projectController = new ProjectController();
const taskSubmissionController = new TaskSubmissionController();
const taskAppealController = new TaskAppealController();
const taskOwnershipLogController = new TaskOwnershipLogController();

// Every route below requires a logged-in user
router.use(requireAuth);

router.post("/", writeLimiter, validate({ body: createProjectSchema }), projectController.create);
router.get("/", projectController.list);

// getById/getByTitle are NOT gated by requireProjectRole — the service's
// query already only returns a project if the user is an active member.
// Non-members get a 404, not a 403 (avoids leaking which project ids exist).
router.get("/title/:title", projectController.getByTitle);
router.get("/:projectId", projectController.getById);

router.patch(
  "/:projectId",
  requireProjectRole("leader"),
  validate({ body: updateProjectSchema }),
  projectController.update,
);
router.post("/:projectId/archive", requireProjectRole("leader"), projectController.archive);
router.delete("/:projectId", requireProjectRole("leader"), projectController.remove);

// Project-level dashboards — leader-only review/appeal queues, activity feed
router.get(
  "/:projectId/submissions/pending",
  requireProjectRole("leader"),
  taskSubmissionController.getPendingQueue,
);
router.get(
  "/:projectId/appeals/pending",
  requireProjectRole("leader"),
  taskAppealController.getPendingQueue,
);
router.get(
  "/:projectId/activity",
  requireProjectRole("leader"),
  taskOwnershipLogController.getProjectActivity,
);

// Nested resources
router.use("/:projectId/members", projectMemberRoutes);
router.use("/:projectId/links", projectLinkRoutes);
router.use("/:projectId/tasks", taskRoutes);
router.use("/:projectId/swap-requests", taskSwapRequestRoutes);

export default router;
