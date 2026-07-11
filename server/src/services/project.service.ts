import { db } from "../database";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectMembersRepository } from "../repositories/projectMember.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../schemas/project.schema";
import { ProjectRole } from "../database/types";

const projectRepository = new ProjectRepository();
const projectMembersRepository = new ProjectMembersRepository();

export class ProjectService {
  async createProject(input: CreateProjectInput, creatorId: number) {
    return await db.transaction().execute(async (trx) => {
      const project = await projectRepository.createProject(
        {
          title: input.title,
          status: "ongoing",
          deadline: input.deadline || null,
          allow_free_swap: input.allow_free_swap,
        },
        trx,
      );

      await projectMembersRepository.create(
        {
          project_id: project.id,
          user_id: creatorId,
          role: "leader",
        },
        trx,
      );
      return project;
    });
  }

  async getProjectsByUser(userId: number, role?: ProjectRole) {
    return await projectRepository.getProjectsByUser(userId, role);
  }
  async getProjectById(id: number, userId: number) {
    const project = await projectRepository.getProjectById(id, userId);
    if (!project) {
      throw new NotFoundError("Project");
    }
    return project;
  }

  async updateProject(id: number, userId: number, input: UpdateProjectInput) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      userId,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can update this project",
      );
    }
    const updated = await projectRepository.updateProject(id, {
      title: input.title,
      status: input.status,
      deadline: input.deadline,
      allow_free_swap: input.allow_free_swap,
    });
    if (!updated) {
      throw new NotFoundError("Project");
    }
    return updated;
  }

  async archiveProject(id: number, userId: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      userId,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can archieve this project",
      );
    }
    const archived = await projectRepository.updateProject(id, {
      is_archived: true,
      archived_at: new Date(),
    });
    if (!archived) {
      throw new NotFoundError("Project");
    }
    return archived;
  }

  async deleteProject(id: number, userId: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      userId,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can archieve this project",
      );
    }
    const deleted = await projectRepository.deleteProject(id);
    if (!deleted) {
      throw new NotFoundError("Project");
    }
    return deleted;
  }
}
