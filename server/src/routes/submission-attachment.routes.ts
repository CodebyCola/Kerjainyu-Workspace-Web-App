import { Router } from "express";
import { SubmissionAttachmentController } from "../controllers/submission-attachment.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";

// mergeParams — needs :projectId, :taskId, :submissionId from parent routers
const router = Router({ mergeParams: true });
const submissionAttachmentController = new SubmissionAttachmentController();

router.get("/", requireProjectRole("leader", "member"), submissionAttachmentController.list);

export default router;
