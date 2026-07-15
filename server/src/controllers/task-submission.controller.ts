import { Request, Response, NextFunction } from "express";
import { TaskSubmissionService } from "../services/task-submission.service";

const taskSubmissionService = new TaskSubmissionService();

export class TaskSubmissionController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const submission = await taskSubmissionService.submitTask(
        taskId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(201).json({ success: true, data: { submission } });
    } catch (err) {
      next(err);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const submissionId = Number(req.params.submissionId);
      const submission = await taskSubmissionService.reviewSubmission(
        submissionId,
        taskId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ success: true, data: { submission } });
    } catch (err) {
      next(err);
    }
  }

  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const submission = await taskSubmissionService.getLatestSubmission(
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { submission } });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const submissions = await taskSubmissionService.getSubmissionHistory(
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { submissions } });
    } catch (err) {
      next(err);
    }
  }

  async getPendingQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const submissions = await taskSubmissionService.getPendingSubmissions(
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { submissions } });
    } catch (err) {
      next(err);
    }
  }
}
