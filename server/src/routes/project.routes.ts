import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { TaskController } from "../controllers/task.controller";
import { TaskSubmissionController } from "../controllers/task-submission.controller";
import { TaskAppealController } from "../controllers/task-appeal.controller";
import { TaskOwnershipLogController } from "../controllers/task-ownership-log.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { writeLimiter } from "../middlewares/rateLimiter.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema";
import projectMemberRoutes from "./project-member.routes";
import projectLinkRoutes from "./project-link.routes";
import taskRoutes from "./task.routes";
import taskSwapRequestRoutes from "./task-swap-request.routes";
import { SubmissionAttachmentController } from "../controllers/submission-attachment.controller";

const router = Router();

const projectController = new ProjectController();
const taskController = new TaskController();
const taskSubmissionController = new TaskSubmissionController();
const taskAppealController = new TaskAppealController();
const taskOwnershipLogController = new TaskOwnershipLogController();
const submissionAttachmentController = new SubmissionAttachmentController();
// Every route below requires a logged-in user
router.use(requireAuth);

router.post(
  "/",
  writeLimiter,
  validate({ body: createProjectSchema }),
  projectController.create,
);
router.get("/", projectController.list);

router.get("/tasks/mine", taskController.getMineAcrossProjects);

router.get("/title/:title", projectController.getByTitle);
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

router.get(
  "/:projectId/attachments",
  requireProjectRole("leader", "member"),
  submissionAttachmentController.listForProject,
);

// Nested resources
router.use("/:projectId/members", projectMemberRoutes);
router.use("/:projectId/links", projectLinkRoutes);
router.use("/:projectId/tasks", taskRoutes);
router.use("/:projectId/swap-requests", taskSwapRequestRoutes);

export default router;
