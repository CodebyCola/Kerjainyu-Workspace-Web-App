import { Request, Response, NextFunction } from "express";
import { taskService as TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const tasks = await taskService.getTasksByProject(projectId);
      res.status(200).json({ success: true, data: { tasks } });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.getTaskById(taskId, projectId);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async getClaimable(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const tasks = await taskService.getClaimableTasks(projectId);
      res.status(200).json({ success: true, data: { tasks } });
    } catch (err) {
      next(err);
    }
  }

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const tasks = await taskService.getTaskByAssignee(req.user!.userId, projectId);
      res.status(200).json({ success: true, data: { tasks } });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const task = await taskService.createTask(projectId, req.body);
      res.status(201).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.updateTask(taskId, req.user!.userId, req.body, projectId);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  // Self-service status change (todo -> ongoing). "-> submitted" goes
  // through TaskSubmissionController.submit instead, not this endpoint.
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const { status } = req.body;
      const task = await taskService.updateTaskStatus(taskId, projectId, req.user!.userId, status);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      await taskService.deleteTask(taskId, req.user!.userId, projectId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async claim(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.claimTask(taskId, projectId, req.user!.userId);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async reassign(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const { new_assignee_id } = req.body;
      const task = await taskService.reassignTask(taskId, projectId, req.user!.userId, new_assignee_id);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async release(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.releaseTask(taskId, projectId, req.user!.userId);
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }
}
