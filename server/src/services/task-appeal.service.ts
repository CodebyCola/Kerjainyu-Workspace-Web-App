import { TaskAppealRepository } from "../repositories/task-appeal.repository";
import { TaskRepository } from "../repositories/task.repository";
import { TaskSubmissionRepository } from "../repositories/task-submission.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import {
  CreateTaskAppealInput,
  ResolveAppealInput,
} from "../schemas/task-appeal.schema";
import { AppealStatus } from "../database/types";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();
const taskAppealRepository = new TaskAppealRepository();
const taskRepository = new TaskRepository();
const taskSubmissionRepository = new TaskSubmissionRepository();
const projectMemberRepository = new ProjectMemberRepository();

export class TaskAppealService {
  async raiseAppeal(
    task_id: number,
    project_id: number,
    user_id: number,
    input: CreateTaskAppealInput,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    if (task.assignee_id !== user_id) {
      throw new ForbiddenError("Only the assignee can appeal this task");
    }

    if (input.submission_id) {
      const submission = await taskSubmissionRepository.getById(
        input.submission_id,
        task_id,
      );
      if (!submission) throw new NotFoundError("Submission");
    }
    // No submission_id = appealing while still ongoing, per your schema comment

    const existingPending =
      await taskAppealRepository.getPendingByTask(task_id);
    if (existingPending.length > 0) {
      throw new ConflictError("This task already has a pending appeal");
    }

    return await taskAppealRepository.create({
      task_id,
      submission_id: input.submission_id ?? null,
      raised_by: user_id,
      reason: input.reason,
    });
  }

  async resolveAppeal(
    id: number,
    task_id: number,
    project_id: number,
    resolver_id: number,
    input: ResolveAppealInput,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const appeal = await taskAppealRepository.getById(id, task_id);
    if (!appeal) throw new NotFoundError("Appeal");

    if (appeal.status !== "pending") {
      throw new ConflictError("This appeal has already been resolved");
    }

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      resolver_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can resolve appeals");
    }

    const resolved = await taskAppealRepository.resolve(id, task_id, {
      status: input.status,
      resolution_note: input.resolution_note ?? null,
      resolved_by: resolver_id,
      resolved_at: new Date(),
    });

    await notificationService.notify(
      appeal.raised_by,
      "appeal_updated",
      `Your appeal on "${task.title}" was ${input.status}`,
      { reference_type: "appeal", reference_id: id },
    );

    return resolved;
  }

  async getAppealsForTask(
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

    return await taskAppealRepository.getAllByTask(task_id);
  }

  async getPendingAppealsForProject(
    project_id: number,
    user_id: number,
    status?: AppealStatus,
  ) {
    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can view the appeals queue");
    }
    return await taskAppealRepository.getByProject(project_id, status);
  }
}