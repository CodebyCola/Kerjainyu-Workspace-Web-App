import { Request, Response, NextFunction } from "express";
import { TaskAppealService } from "../services/task-appeal.service";

const taskAppealService = new TaskAppealService();

export class TaskAppealController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const appeal = await taskAppealService.raiseAppeal(
        taskId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(201).json({ success: true, data: { appeal } });
    } catch (err) {
      next(err);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const appealId = Number(req.params.appealId);
      const appeal = await taskAppealService.resolveAppeal(
        appealId,
        taskId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ success: true, data: { appeal } });
    } catch (err) {
      next(err);
    }
  }

  async getForTask(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const appeals = await taskAppealService.getAppealsForTask(taskId, projectId, req.user!.userId);
      res.status(200).json({ success: true, data: { appeals } });
    } catch (err) {
      next(err);
    }
  }

  async getPendingQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const status = req.query.status as any;
      const appeals = await taskAppealService.getPendingAppealsForProject(
        projectId,
        req.user!.userId,
        status,
      );
      res.status(200).json({ success: true, data: { appeals } });
    } catch (err) {
      next(err);
    }
  }
}
