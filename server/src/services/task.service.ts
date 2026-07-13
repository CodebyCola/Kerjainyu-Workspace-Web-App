import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { CreateTaskData, UpdateTaskData } from "../types/task";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import { TaskStatus } from "../database/types";

const taskRepository = new TaskRepository();
const projectMemberRepository = new ProjectMemberRepository();
const ALLOWED_SELF_TRANSITIONS: Record<string, TaskStatus[]> = {
  todo: ["ongoing"],
  ongoing: ["submitted"],
};
export class taskService {
  async getTasksByProject(project_id: number) {
    return await taskRepository.getTasksByProject(project_id);
  }
  async getTaskById(id: number, project_id: number) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");
    return task;
  }
  async getClaimableTasks(project_id: number) {
    return await taskRepository.getClaimableTasks(project_id);
  }
  async getTaskByAssignee(assignee_id: number, project_id: number) {
    return await taskRepository.getTaskByAssignee(assignee_id, project_id);
  }
  async createTask(project_id: number, data: CreateTaskData) {
    const existingTask = await taskRepository.getTaskByTitle(
      data.title,
      project_id,
    );
    if (existingTask) {
      throw new ConflictError("Task with this title already exists");
    }
    return await taskRepository.create(project_id, data);
  }
  async updateTask(
    id: number,
    user_id: number,
    data: UpdateTaskData,
    project_id: number,
  ) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can update this task");
    }
    if (data.title && data.title !== task.title) {
      const existingTask = await taskRepository.getTaskByTitle(
        data.title,
        project_id,
      );
      if (existingTask) {
        throw new ConflictError("Task with this title already exists");
      }
    }
    return await taskRepository.updateTask(id, data, project_id);
  }
  async updateTaskStatus(
    id: number,
    project_id: number,
    assignee_id: number,
    status: TaskStatus,
  ) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");
    if (task.assignee_id !== assignee_id) {
      throw new ForbiddenError("Only the assignee can update the task status");
    }
    const allowed = ALLOWED_SELF_TRANSITIONS[task.status] ?? [];
    if (!allowed.includes(status)) {
      throw new ConflictError(
        `Cannot change status from ${task.status} to ${status}`,
      );
    }
    return await taskRepository.updateTaskStatus(id, project_id, status);
  }
  async deleteTask(id: number, user_id: number, project_id: number) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can delete this task");
    }
    return await taskRepository.deleteTask(id, project_id);
  }
  async claimTask(id: number, project_id: number, user_id: number) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");

    const claimed = await taskRepository.claimTask(id, project_id, user_id);
    if (!claimed) {
      throw new ConflictError("This task has already been claimed");
    }
    return claimed;
  }
  async reassignTask(
    id: number,
    project_id: number,
    leader_id: number,
    new_assignee_id: number,
  ) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");
    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      leader_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can reassign this task");
    }
    const newAssigneeMembership =
      await projectMemberRepository.findByProjectAndUser(
        project_id,
        new_assignee_id,
      );
    if (!newAssigneeMembership) {
      throw new NotFoundError("New assignee is not a member of this project");
    }
    return await taskRepository.updateTask(
      id,
      { assignee_id: new_assignee_id },
      project_id,
    );
  }
  async releaseTask(id: number, project_id: number, user_id: number) {
    const task = await taskRepository.getTaskById(id, project_id);
    if (!task) throw new NotFoundError("Task");
    if (task.is_claimable === false) {
      throw new ConflictError("This task is not claimable");
    }
    if (task.assignee_id !== user_id) {
      throw new ForbiddenError("Only the assignee can release this task");
    }
    if (task.status === "submitted") {
      throw new ConflictError(
        "Cannot release a task that has been submitted for review",
      );
    }
    return await taskRepository.updateTask(
      id,
      { assignee_id: null, status: "unclaimed" },
      project_id,
    );
  }
}
