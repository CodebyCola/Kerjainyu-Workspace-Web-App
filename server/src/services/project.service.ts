import { db } from "../database";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { ProjectLinkRepository } from "../repositories/project-link.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../schemas/project.schema";
import { ProjectRole } from "../database/types";

const projectRepository = new ProjectRepository();
const projectMembersRepository = new ProjectMemberRepository();
const projectLinkRepository = new ProjectLinkRepository();

function serializeProject<
  T extends {
    viewer_role: "leader" | "member";
    member_count: string | number | bigint | null;
  },
>(project: T) {
  const { viewer_role, member_count, ...rest } = project;
  return {
    ...rest,
    role: viewer_role,
    memberCount: member_count === null ? 0 : Number(member_count),
  };
}

export class ProjectService {
  async createProject(input: CreateProjectInput, creator_id: number) {
    return await db.transaction().execute(async (trx) => {
      const project = await projectRepository.createProject(
        {
          title: input.title,
          status: "ongoing",
          deadline: input.deadline || null,
          allow_free_swap: input.allowFreeSwap,
        },
        trx,
      );
      if (input.links?.length) {
        await projectLinkRepository.createMany(
          project.id,
          input.links,
          creator_id,
          trx,
        );
      }
      await projectMembersRepository.create(
        {
          project_id: project.id,
          user_id: creator_id,
          role: "leader",
          status: "active",
        },
        trx,
      );
      return project;
    });
  }

  async getProjectsByUser(user_id: number, role?: ProjectRole) {
    const projects = await projectRepository.getProjectsByUser(user_id, role);
    return projects.map(serializeProject);
  }
  async getProjectById(id: number, user_id: number) {
    const project = await projectRepository.getProjectById(id, user_id);
    if (!project) {
      throw new NotFoundError("Project");
    }
    return serializeProject(project);
  }

  async getProjectByTitle(title: string, user_id: number) {
    const project = await projectRepository.getProjectByTitle(title, user_id);
    if (!project) {
      throw new NotFoundError("Project");
    }
    return serializeProject(project);
  }

  async updateProject(id: number, user_id: number, input: UpdateProjectInput) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can update this project",
      );
    }
    const updated = await projectRepository.updateProject(id, user_id, {
      title: input.title,
      status: input.status,
      deadline: input.deadline,
      allow_free_swap: input.allowFreeSwap,
    });
    if (!updated) {
      throw new NotFoundError("Project");
    }
    return updated;
  }

  async archiveProject(id: number, user_id: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can archive this project",
      );
    }
    const archived = await projectRepository.updateProject(id, user_id, {
      is_archived: true,
      is_archived_at: new Date(),
    });
    if (!archived) {
      throw new NotFoundError("Project");
    }
    return archived;
  }

  async deleteProject(id: number, user_id: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the project leader can delete this project",
      );
    }
    const deleted = await projectRepository.deleteProject(id, user_id);
    if (!deleted) {
      throw new NotFoundError("Project");
    }
    return deleted;
  }
}
