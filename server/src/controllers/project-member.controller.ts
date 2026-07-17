import { Request, Response, NextFunction } from "express";
import { ProjectMemberService } from "../services/project-member.service";
import { CreateProjectMemberSchema } from "../schemas/project-member.schema";

const projectMemberService = new ProjectMemberService();

export class ProjectMemberController {
  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const input = req.body as CreateProjectMemberSchema;
      const member = await projectMemberService.addMember(projectId, input);
      res.status(201).json({ success: true, data: { member } });
    } catch (err) {
      next(err);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const members = await projectMemberService.listMembers(projectId);
      res.status(200).json({ success: true, data: { members } });
    } catch (err) {
      next(err);
    }
  }

  async lookupMember(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const username = String(req.query.username ?? "").trim();
      if (!username) {
        return res
          .status(400)
          .json({ success: false, error: "username query param is required" });
      }
      const result = await projectMemberService.lookupMember(
        projectId,
        username,
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const targetUserId = Number(req.params.userId);
      const leaderId = req.user!.userId;
      await projectMemberService.removeMember(
        projectId,
        targetUserId,
        leaderId,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async transferLeader(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      const currentLeaderId = req.user!.userId;
      const { new_leader_id } = req.body as { new_leader_id: number };
      const result = await projectMemberService.transferLeader(
        projectId,
        currentLeaderId,
        new_leader_id,
      );
      res.status(200).json({ success: true, data: { membership: result } });
    } catch (err) {
      next(err);
    }
  }

  async leaveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      await projectMemberService.leaveProject(projectId, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
