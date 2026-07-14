import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database, SwapRequestStatus } from "../database/types";
import {
  CreateSwapRequestData,
  UpdateSwapRequestData,
} from "../types/task-swap-request";

type Executor = Kysely<Database>;

export class TaskSwapRequestRepository {
  async create(data: CreateSwapRequestData, executor: Executor = db) {
    return await executor
      .insertInto("task_swap_requests")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: number,
    task_id: number,
    data: UpdateSwapRequestData,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("task_swap_requests")
      .set(data)
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .returningAll()
      .executeTakeFirst();
  }

  async getById(id: number) {
    return await db
      .selectFrom("task_swap_requests")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }

  async getPendingByTask(task_id: number) {
    return await db
      .selectFrom("task_swap_requests")
      .where("task_id", "=", task_id)
      .where("status", "=", "pending")
      .selectAll()
      .execute();
  }

  async getByProject(project_id: number, status?: SwapRequestStatus) {
    let query = db
      .selectFrom("task_swap_requests")
      .innerJoin("tasks", "tasks.id", "task_swap_requests.task_id")
      .where("tasks.project_id", "=", project_id)
      .selectAll("task_swap_requests")
      .orderBy("task_swap_requests.created_at", "desc");

    if (status) {
      query = query.where("task_swap_requests.status", "=", status);
    }
    return await query.execute();
  }
}
