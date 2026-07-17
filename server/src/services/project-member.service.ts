import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { UserRepository } from "../repositories/user.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import { CreateProjectMemberSchema } from "../schemas/project-member.schema";
import { NotificationService } from "./notification.service";
import { db } from "../database";
const projectMembersRepository = new ProjectMemberRepository();
const userRepository = new UserRepository();
const projectRepository = new ProjectRepository();
const notificationService = new NotificationService();

export class ProjectMemberService {
  async addMember(project_id: number, input: CreateProjectMemberSchema) {
    const user = await userRepository.findByUsernamePublic(input.username);
    if (!user) {
      throw new NotFoundError(`User "${input.username}"`);
    }

    const existing =
      await projectMembersRepository.findByProjectAndUserAnyStatus(
        project_id,
        user.id,
      );

    if (existing?.status === "active") {
      throw new ConflictError(
        `${input.username} is already a member of this project`,
      );
    }
    if (existing?.status === "invited") {
      throw new ConflictError(
        `${input.username} already has a pending invite to this project`,
      );
    }

    const invite = existing ? await projectMembersRepository.reactivate(
          project_id,
          user.id,
          input.role,
        ) : await projectMembersRepository.create({
          project_id: project_id,
          role: input.role,
          user_id: user.id,
        });
 
    const project = await projectRepository.getById(project_id);
    await notificationService.notify(
      user.id,
      "member_invited",
      project
        ? `You were invited to join "${project.title}"`
        : "You were invited to join a project",
      { reference_type: "project", reference_id: project_id },
    );

    return invite;
  }

  async getMyInvites(user_id: number) {
    return await projectMembersRepository.listPendingInvitesForUser(user_id);
  }

  async acceptInvite(project_id: number, user_id: number) {
    const invite = await projectMembersRepository.findPendingInvite(
      project_id,
      user_id,
    );
    if (!invite) {
      throw new NotFoundError("Invite");
    }
    const membership = await projectMembersRepository.acceptInvite(
      project_id,
      user_id,
    );
    await notificationService.resolveByReference(
      user_id,
      "member_invited",
      "project",
      project_id,
    );
    return membership;
  }

  async declineInvite(project_id: number, user_id: number) {
    const invite = await projectMembersRepository.findPendingInvite(
      project_id,
      user_id,
    );
    if (!invite) {
      throw new NotFoundError("Invite");
    }
    const membership = await projectMembersRepository.declineInvite(
      project_id,
      user_id,
    );
    await notificationService.resolveByReference(
      user_id,
      "member_invited",
      "project",
      project_id,
    );
    return membership;
  }

  async lookupMember(project_id: number, username: string) {
    const user = await userRepository.findByUsernamePublic(username);
    if (!user) {
      throw new NotFoundError(`User "${username}"`);
    }

    const existing =
      await projectMembersRepository.findByProjectAndUserAnyStatus(
        project_id,
        user.id,
      );

    return {
      id: user.id,
      username: user.username,
      alreadyMember: existing?.status === "active",
    };
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
