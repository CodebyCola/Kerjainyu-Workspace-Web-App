import { Request, Response, NextFunction } from "express";
import { TaskOwnershipLogService } from "../services/task-ownership-log.service";

const taskOwnershipLogService = new TaskOwnershipLogService();

export class TaskOwnershipLogController {
  async getForTask(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const logs = await taskOwnershipLogService.getHistoryForTask(
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { logs } });
    } catch (err) {
      next(err);
    }
  }

  async getProjectActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const reason = req.query.reason as any;
      const logs = await taskOwnershipLogService.getProjectActivity(
        projectId,
        req.user!.userId,
        reason,
      );
      res.status(200).json({ success: true, data: { logs } });
    } catch (err) {
      next(err);
    }
  }
}
