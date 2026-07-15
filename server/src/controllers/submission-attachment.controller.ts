import { Request, Response, NextFunction } from "express";
import { SubmissionAttachmentService } from "../services/submission-attachment.service";

const submissionAttachmentService = new SubmissionAttachmentService();

export class SubmissionAttachmentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const submissionId = Number(req.params.submissionId);
      const attachments = await submissionAttachmentService.getAttachmentsForSubmission(
        submissionId,
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { attachments } });
    } catch (err) {
      next(err);
    }
  }
}
