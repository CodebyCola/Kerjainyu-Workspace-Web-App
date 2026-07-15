// services/task-swap-request.service.ts
import { db } from "../database";
import { TaskSwapRequestRepository } from "../repositories/task-swap-request.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { TaskOwnershipLogRepository } from "../repositories/task-ownership-log.repository";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import {
  CreateSwapRequestInput,
  ResolveSwapRequestInput,
} from "../schemas/task-swap.schema";
import { SwapRequestStatus } from "../database/types";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();
const taskSwapRepository = new TaskSwapRequestRepository();
const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const projectMemberRepository = new ProjectMemberRepository();
const taskOwnershipLogRepository = new TaskOwnershipLogRepository();

export class TaskSwapRequestService {
  async createSwapRequest(
    project_id: number,
    requested_by: number,
    input: CreateSwapRequestInput,
  ) {
    const task = await taskRepository.getTaskById(input.task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    // Only the current owner can offer their own task
    if (task.assignee_id !== requested_by) {
      throw new ForbiddenError(
        "You can only offer a task that's assigned to you",
      );
    }

    if (input.requested_to === requested_by) {
      throw new ConflictError("You can't request a swap with yourself");
    }

    const targetMembership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      input.requested_to,
    );
    if (!targetMembership) {
      throw new NotFoundError(
        "The member you're requesting a swap with is not the member of the project",
      );
    }

    if (input.target_task_id) {
      const targetTask = await taskRepository.getTaskById(
        input.target_task_id,
        project_id,
      );
      if (!targetTask) throw new NotFoundError("Target task");
      if (targetTask.assignee_id !== input.requested_to) {
        throw new ConflictError(
          "The target task doesn't belong to the requested member",
        );
      }
    }

    const existingPending = await taskSwapRepository.getPendingByTask(
      input.task_id,
    );
    if (existingPending.length > 0) {
      throw new ConflictError("This task already has a pending swap request");
    }

    const swapRequest = await taskSwapRepository.create({
      task_id: input.task_id,
      target_task_id: input.target_task_id ?? null,
      requested_by,
      requested_to: input.requested_to,
    });

    await notificationService.notify(
      input.requested_to,
      "swap_requested",
      `A swap was requested for "${task.title}"`,
      { reference_type: "swap_request", reference_id: swapRequest.id },
    );

    return swapRequest;
  }

  async cancelSwapRequest(id: number, project_id: number, user_id: number) {
    const swapRequest = await taskSwapRepository.getById(id);
    if (!swapRequest) throw new NotFoundError("Swap request");

    const task = await taskRepository.getTaskById(
      swapRequest.task_id,
      project_id,
    );
    if (!task) throw new NotFoundError("Swap request"); // task not in this project — treat as not found

    if (swapRequest.requested_by !== user_id) {
      throw new ForbiddenError(
        "Only the requester can cancel this swap request",
      );
    }
    if (swapRequest.status !== "pending") {
      throw new ConflictError("Only a pending swap request can be cancelled");
    }

    return await taskSwapRepository.update(id, swapRequest.task_id, {
      status: "cancelled",
    });
  }

  async resolveSwapRequest(
    id: number,
    project_id: number,
    resolver_id: number,
    input: ResolveSwapRequestInput,
  ) {
    const swapRequest = await taskSwapRepository.getById(id);
    if (!swapRequest) throw new NotFoundError("Swap request");

    const task = await taskRepository.getTaskById(
      swapRequest.task_id,
      project_id,
    );
    if (!task) throw new NotFoundError("Swap request");

    if (swapRequest.status !== "pending") {
      throw new ConflictError("This swap request has already been resolved");
    }

    const project = await projectRepository.getById(project_id);
    if (!project) throw new NotFoundError("Project");

    // Who's allowed to resolve depends on the project's swap policy
    if (project.allow_free_swap) {
      if (resolver_id !== swapRequest.requested_to) {
        throw new ForbiddenError(
          "Only the requested member can respond to this swap",
        );
      }
    } else {
      const membership = await projectMemberRepository.findByProjectAndUser(
        project_id,
        resolver_id,
      );
      if (!membership || membership.role !== "leader") {
        throw new ForbiddenError(
          "Only the leader can approve swaps for this project",
        );
      }
    }

    if (input.status === "rejected") {
      return await taskSwapRepository.update(id, swapRequest.task_id, {
        status: "rejected",
        resolved_by: resolver_id,
        resolved_at: new Date(),
      });
    }

    // Approved — actually move ownership, atomically
    const resolved = await db.transaction().execute(async (trx) => {
      await taskRepository.updateTask(
        swapRequest.task_id,
        { assignee_id: swapRequest.requested_to },
        project_id,
        trx,
      );
      await taskOwnershipLogRepository.createLog(
        {
          task_id: swapRequest.task_id,
          from_user_id: swapRequest.requested_by,
          to_user_id: swapRequest.requested_to,
          reason: "swap",
        },
        trx,
      );

      // Two-way swap — the target task goes the other direction
      if (swapRequest.target_task_id) {
        await taskRepository.updateTask(
          swapRequest.target_task_id,
          { assignee_id: swapRequest.requested_by },
          project_id,
          trx,
        );
        await taskOwnershipLogRepository.createLog(
          {
            task_id: swapRequest.target_task_id,
            from_user_id: swapRequest.requested_to,
            to_user_id: swapRequest.requested_by,
            reason: "swap",
          },
          trx,
        );
      }

      return await taskSwapRepository.update(
        id,
        swapRequest.task_id,
        {
          status: "approved",
          resolved_by: resolver_id,
          resolved_at: new Date(),
        },
        trx,
      );
    });

    await Promise.all([
      notificationService.notify(
        swapRequest.requested_by,
        "task_swapped",
        `Your swap for "${task.title}" was approved`,
        { reference_type: "swap_request", reference_id: id },
      ),
      notificationService.notify(
        swapRequest.requested_to,
        "task_swapped",
        `A swap involving "${task.title}" was approved`,
        { reference_type: "swap_request", reference_id: id },
      ),
    ]);

    return resolved;
  }

  async getPendingSwapRequestsForTask(task_id: number, project_id: number) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");
    return await taskSwapRepository.getPendingByTask(task_id);
  }

  async getSwapRequestsByProject(
    project_id: number,
    user_id: number,
    status?: SwapRequestStatus,
  ) {
    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership)
      throw new ForbiddenError("You are not a member of this project");
    return await taskSwapRepository.getByProject(project_id, status);
  }
}
