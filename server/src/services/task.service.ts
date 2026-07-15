import { TaskRepository, MyTaskFilters } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { TaskOwnershipLogRepository } from "../repositories/task-ownership-log.repository";
import { CreateTaskData, UpdateTaskData } from "../types/task";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import { TaskStatus } from "../database/types";
import { db } from "../database";
import { NotificationService } from "./notification.service";
import { CreateTaskInput } from "../schemas/task.schema";

const taskRepository = new TaskRepository();
const taskOwnershipLogRepository = new TaskOwnershipLogRepository();
const notificationService = new NotificationService();
const projectMemberRepository = new ProjectMemberRepository();
const ALLOWED_SELF_TRANSITIONS: Record<string, TaskStatus[]> = {
  todo: ["ongoing"],
  // ongoing: ["submitted"],
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
  /** Cross-project "My Tasks" — see TaskRepository.getTaskByAssigneeAcrossProjects. */
  async getMyTasksAcrossProjects(assignee_id: number, filters: MyTaskFilters) {
    return await taskRepository.getTaskByAssigneeAcrossProjects(
      assignee_id,
      filters,
    );
  }
  async createTask(
    project_id: number,
    created_by: number,
    input: CreateTaskInput,
  ) {
    const existingTask = await taskRepository.getTaskByTitle(
      input.title,
      project_id,
    );
    if (existingTask) {
      throw new ConflictError("Task with this title already exists");
    }
    const data: CreateTaskData = {
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority ?? null,
      display_order: input.displayOrder,
      deadline: input.deadline ?? null,
      created_by,
      assignee_id: input.assignee_id ?? null,
      is_claimable: input.isClaimable,
    };
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
    return await db.transaction().execute(async (trx) => {
      const claimed = await taskRepository.claimTask(
        id,
        user_id,
        project_id,
        trx,
      );
      if (!claimed) {
        throw new ConflictError("This task has already been claimed");
      }
      await taskOwnershipLogRepository.createLog(
        {
          task_id: id,
          from_user_id: null,
          to_user_id: user_id,
          reason: "claimed",
        },
        trx,
      );

      await notificationService.notify(
        task.created_by, // notify whoever created the task (likely the leader)
        "task_assigned",
        `${claimed.title} was claimed`,
        { reference_type: "task", reference_id: claimed.id },
      );
      return claimed;
    });
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
    return await db.transaction().execute(async (trx) => {
      if (task.status === "unclaimed") {
        await taskOwnershipLogRepository.createLog(
          {
            task_id: id,
            from_user_id: null,
            to_user_id: new_assignee_id,
            reason: "reassigned",
          },
          trx,
        );
      } else {
        await taskOwnershipLogRepository.createLog(
          {
            task_id: id,
            from_user_id: task.assignee_id,
            to_user_id: new_assignee_id,
            reason: "reassigned",
          },
          trx,
        );
      }
      const updated = await taskRepository.updateTask(
        id,
        { assignee_id: new_assignee_id },
        project_id,
        trx,
      );
      return updated;
    });
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
