import { Request, Response, NextFunction } from "express";
import { ProjectMemberService } from "../services/project-member.service";

const projectMemberService = new ProjectMemberService();

export class InviteController {
  /** GET /invites — every pending invite waiting on the caller, across every project. */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const invites = await projectMemberService.getMyInvites(req.user!.userId);
      res.status(200).json({ success: true, data: { invites } });
    } catch (err) {
      next(err);
    }
  }

  /** POST /invites/:projectId/accept */
  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const membership = await projectMemberService.acceptInvite(
        projectId,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: { membership } });
    } catch (err) {
      next(err);
    }
  }

  /** POST /invites/:projectId/decline */
  async decline(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      await projectMemberService.declineInvite(projectId, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
