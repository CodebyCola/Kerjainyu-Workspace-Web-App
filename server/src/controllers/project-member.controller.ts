import { Request, Response, NextFunction } from "express";
import { ProjectMemberService } from "../services/project-member.service";
import { CreateProjectMemberSchema } from "../schemas/project-member.schema";

const projectMemberService = new ProjectMemberService()

export class ProjectMemberController {
    async getAllMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const project_id = Number(req.params.id);
            const members = await projectMemberService.listMembers(project_id);
            res.status(201).json({ success: true, data: { members } })
        } catch (error) {
            next(error)
        }
    }
    async addMember(req: Request, res: Response, next: NextFunction) {
        try {
            const project_id = Number(req.params.id)
            await projectMemberService.addMember(project_id, req.body);
            res.status(201).json({ success: true, message: "Successfuly added member" })
        } catch (error) {
            next(error)
        }
    }
    async removeMember(req: Request, res: Response, next: NextFunction) {
        try {
            const leader_id = Number(req.user?.userId);
            const projectId = Number(req.params.project_id)
            const user_id = Number(req.params.user_id);
            await projectMemberService.removeMember(projectId, user_id, leader_id)
        } catch (error) {
            next(error)
        }
    }
}