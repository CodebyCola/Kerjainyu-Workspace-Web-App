import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTaskSchema } from "../schemas/task.schema";
import taskSubmissionRoutes from "./task-submission.routes";
import taskAppealRoutes from "./task-appeal.routes";
import taskCommentRoutes from "./task-comment.routes";
import taskOwnershipLogRoutes from "./task-ownership-log.routes";

// mergeParams — needs :projectId from project.routes.ts
const router = Router({ mergeParams: true });
const taskController = new TaskController();

router.get("/", requireProjectRole("leader", "member"), taskController.list);
router.get("/claimable", requireProjectRole("leader", "member"), taskController.getClaimable);
router.get("/mine", requireProjectRole("leader", "member"), taskController.getMine);
router.get("/:taskId", requireProjectRole("leader", "member"), taskController.getById);

router.post(
  "/",
  requireProjectRole("leader"),
  validate({ body: createTaskSchema }),
  taskController.create,
);

router.patch("/:taskId", requireProjectRole("leader"), taskController.update);

// Self-service: assignee moves their own task todo -> ongoing.
// "-> submitted" happens via POST /:taskId/submissions instead.
router.patch(
  "/:taskId/status",
  requireProjectRole("leader", "member"),
  taskController.updateStatus,
);

router.delete("/:taskId", requireProjectRole("leader"), taskController.remove);

router.post("/:taskId/claim", requireProjectRole("leader", "member"), taskController.claim);
router.post("/:taskId/reassign", requireProjectRole("leader"), taskController.reassign);
router.post("/:taskId/release", requireProjectRole("leader", "member"), taskController.release);

router.use("/:taskId/submissions", taskSubmissionRoutes);
router.use("/:taskId/appeals", taskAppealRoutes);
router.use("/:taskId/comments", taskCommentRoutes);
router.use("/:taskId/ownership-log", taskOwnershipLogRoutes);

export default router;
