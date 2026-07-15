import { Request, Response, NextFunction } from "express";
import { ProjectLinkService } from "../services/project-link.service";

const projectLinkService = new ProjectLinkService();

export class ProjectLinkController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const links = await projectLinkService.getAllLinksByProject(projectId);
      res.status(200).json({ success: true, data: { links } });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const link = await projectLinkService.addLinkToProject(req.body, projectId, req.user!.userId);
      res.status(201).json({ success: true, data: { link } });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const linkId = Number(req.params.linkId);
      const link = await projectLinkService.updateLink(linkId, req.body, projectId);
      res.status(200).json({ success: true, data: { link } });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const linkId = Number(req.params.linkId);
      await projectLinkService.deleteLink(linkId, projectId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
