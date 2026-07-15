import { Request, Response, NextFunction } from "express";
import { TaskSwapRequestService } from "../services/task-swap-request.service";

const taskSwapRequestService = new TaskSwapRequestService();

export class TaskSwapRequestController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const swapRequest = await taskSwapRequestService.createSwapRequest(
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(201).json({ success: true, data: { swapRequest } });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const swapRequestId = Number(req.params.swapRequestId);
      await taskSwapRequestService.cancelSwapRequest(swapRequestId, projectId, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const swapRequestId = Number(req.params.swapRequestId);
      const swapRequest = await taskSwapRequestService.resolveSwapRequest(
        swapRequestId,
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ success: true, data: { swapRequest } });
    } catch (err) {
      next(err);
    }
  }

  async getPendingForTask(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const swapRequests = await taskSwapRequestService.getPendingSwapRequestsForTask(
        taskId,
        projectId,
      );
      res.status(200).json({ success: true, data: { swapRequests } });
    } catch (err) {
      next(err);
    }
  }

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const status = req.query.status as any;
      const swapRequests = await taskSwapRequestService.getSwapRequestsByProject(
        projectId,
        req.user!.userId,
        status,
      );
      res.status(200).json({ success: true, data: { swapRequests } });
    } catch (err) {
      next(err);
    }
  }
}
