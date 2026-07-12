import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(
        req.body,
        req.user!.userId,
      );
      res.status(201).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as "leader" | "member" | undefined;
      const projects = await projectService.getProjectsByUser(
        req.user!.userId,
        role,
      );
      res.status(200).json({ success: true, data: { projects } });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const project = await projectService.getProjectById(
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  }

  async getByTitle(req: Request, res: Response, next: NextFunction) {
    try {
      const title = String(req.params.title);
      const project = await projectService.getProjectByTitle(
        title,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const project = await projectService.updateProject(
        projectId,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const project = await projectService.archiveProject(
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { project } });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      await projectService.deleteProject(projectId, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
