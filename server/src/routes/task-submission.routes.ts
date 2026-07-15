import { Router } from "express";
import { TaskSubmissionController } from "../controllers/task-submission.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTaskSubmissionSchema, reviewSubmissionSchema } from "../schemas/task-submission.schema";
import submissionAttachmentRoutes from "./submission-attachment.routes";

// mergeParams — needs :projectId and :taskId from task.routes.ts
const router = Router({ mergeParams: true });
const taskSubmissionController = new TaskSubmissionController();

router.post(
  "/",
  requireProjectRole("leader", "member"), // service enforces "must be the assignee"
  validate({ body: createTaskSubmissionSchema }),
  taskSubmissionController.submit,
);

router.get("/latest", requireProjectRole("leader", "member"), taskSubmissionController.getLatest);
router.get("/history", requireProjectRole("leader", "member"), taskSubmissionController.getHistory);

router.patch(
  "/:submissionId/review",
  requireProjectRole("leader"),
  validate({ body: reviewSubmissionSchema }),
  taskSubmissionController.review,
);

router.use("/:submissionId/attachments", submissionAttachmentRoutes);

export default router;
