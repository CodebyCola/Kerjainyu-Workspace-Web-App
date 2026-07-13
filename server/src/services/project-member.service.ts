import { ProjectMembersRepository } from "../repositories/project-member.repository";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import { CreateProjectMemberSchema } from "../schemas/project-member.schema";
import { db } from "../database";
const projectMembersRepository = new ProjectMembersRepository();

export class ProjectMemberService {
  async addMember(project_id: number, input: CreateProjectMemberSchema) {
    return await projectMembersRepository.create({
      project_id: project_id,
      role: input.role,
      user_id: input.userId,
    });
  }
  async removeMember(project_id: number, user_id: number, leader_id: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership) {
      throw new NotFoundError("User");
    }
    if (membership.role === "leader") {
      throw new ConflictError("Can't remove the leader from this project");
    }
    const leader = await projectMembersRepository.findByProjectAndUser(
      project_id,
      leader_id,
    );
    if (leader?.role !== "leader") {
      throw new ForbiddenError("Only the leader who can remove the members");
    }
    return await projectMembersRepository.removeMember(project_id, user_id);
  }
  async listMembers(project_id: number) {
    return await projectMembersRepository.listActiveMembers(project_id);
  }
  async transferLeader(
    project_id: number,
    current_leader_id: number,
    new_leader_id: number,
  ) {
    const currentLeader = await projectMembersRepository.findByProjectAndUser(
      project_id,
      current_leader_id,
    );
    if (!currentLeader || currentLeader.role !== "leader") {
      throw new ForbiddenError(
        "Only the current leader can transfer leadership",
      );
    }
    const newLeader = await projectMembersRepository.findByProjectAndUser(
      project_id,
      new_leader_id,
    );
    if (!newLeader) {
      throw new NotFoundError("Member");
    }
    if (newLeader.role === "leader") {
      throw new ConflictError("This member already the leader");
    }

    return await db.transaction().execute(async (trx) => {
      await projectMembersRepository.demoteToMember(
        project_id,
        current_leader_id,
        trx,
      );
      return await projectMembersRepository.promoteToLeader(
        project_id,
        new_leader_id,
        trx,
      );
    });
  }

  async leaveProject(project_id: number, user_id: number) {
    const membership = await projectMembersRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership) {
      throw new NotFoundError("Membership");
    }
    if (membership.role === "leader") {
      throw new ConflictError(
        "Leader can't leave the project, you gotta promote other member to leader first",
      );
    }
    return await projectMembersRepository.removeMember(project_id, user_id);
  }
}
