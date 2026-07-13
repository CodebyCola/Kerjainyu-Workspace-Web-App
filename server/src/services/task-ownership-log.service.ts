import { TaskOwnershipLogRepository } from "../repositories/task-ownership-log.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";
import { OwnershipChangeReason } from "../database/types";

const taskOwnershipLogRepository = new TaskOwnershipLogRepository();
const taskRepository = new TaskRepository();
const projectMemberRepository = new ProjectMemberRepository();

export class TaskOwnershipLogService {
  async getHistoryForTask(
    task_id: number,
    project_id: number,
    user_id: number,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership)
      throw new ForbiddenError("You are not a member of this project");

    return await taskOwnershipLogRepository.getLogsByTaskId(task_id);
  }

  async getProjectActivity(
    project_id: number,
    user_id: number,
    reason?: OwnershipChangeReason,
  ) {
    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError(
        "Only the leader can view project-wide activity",
      );
    }

    return await taskOwnershipLogRepository.getLogsByProject(
      project_id,
      reason,
    );
  }
}
