import { Request, Response, NextFunction } from "express";
import { TaskCommentService } from "../services/task-comment.service";

const taskCommentService = new TaskCommentService();

export class TaskCommentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const comment = await taskCommentService.addComment(
        taskId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(201).json({ success: true, data: { comment } });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const comments = await taskCommentService.getCommentsForTask(
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { comments } });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const commentId = Number(req.params.commentId);
      await taskCommentService.deleteComment(commentId, taskId, projectId, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
