import { Request, Response, NextFunction } from "express";
import { taskService as TaskService } from "../services/task.service";
import { TaskStatus } from "../database/types";
import { MyTaskSort } from "../repositories/task.repository";

const taskService = new TaskService();

const VALID_STATUSES: TaskStatus[] = [
  "unclaimed",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
  "rejected",
];
const VALID_SORTS: MyTaskSort[] = [
  "deadline_asc",
  "deadline_desc",
  "priority",
  "recent",
];

export class TaskController {
  async getMineAcrossProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const statusParam = req.query.status;
      const sortParam = req.query.sort;

      const status =
        typeof statusParam === "string" &&
        VALID_STATUSES.includes(statusParam as TaskStatus)
          ? (statusParam as TaskStatus)
          : undefined;

      if (typeof statusParam === "string" && !status) {
        return res.status(400).json({
          success: false,
          error: `Invalid status filter. Expected one of: ${VALID_STATUSES.join(", ")}`,
        });
      }

      const sort =
        typeof sortParam === "string" &&
        VALID_SORTS.includes(sortParam as MyTaskSort)
          ? (sortParam as MyTaskSort)
          : undefined;

      if (typeof sortParam === "string" && !sort) {
        return res.status(400).json({
          success: false,
          error: `Invalid sort option. Expected one of: ${VALID_SORTS.join(", ")}`,
        });
      }

      const tasks = await taskService.getMyTasksAcrossProjects(
        req.user!.userId,
        { status, sort },
      );
      res.status(200).json({ success: true, data: { tasks } });
    } catch (err) {
      next(err);
    }
  }

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
      const tasks = await taskService.getTaskByAssignee(
        req.user!.userId,
        projectId,
      );
      res.status(200).json({ success: true, data: { tasks } });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const task = await taskService.createTask(
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(201).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.updateTask(
        taskId,
        req.user!.userId,
        req.body,
        projectId,
      );
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
      const task = await taskService.updateTaskStatus(
        taskId,
        projectId,
        req.user!.userId,
        status,
      );
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
      const task = await taskService.claimTask(
        taskId,
        projectId,
        req.user!.userId,
      );
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
      const task = await taskService.reassignTask(
        taskId,
        projectId,
        req.user!.userId,
        new_assignee_id,
      );
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async release(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);
      const task = await taskService.releaseTask(
        taskId,
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { task } });
    } catch (err) {
      next(err);
    }
  }
}
