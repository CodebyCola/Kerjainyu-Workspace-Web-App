import { db } from "../database";
import { Database } from "../database/types";
import type { Kysely } from "kysely";
import {
  CreateTaskOwnershipLogData,
  UpdateTaskOwnershipLogData,
} from "../types/task-ownership-log";
type Executor = Kysely<Database>;

export class TaskOwnershipLogRepository {
  createLog(data: CreateTaskOwnershipLogData, executor: Executor = db) {
    return executor
      .insertInto("task_ownership_log")
      .values({
        task_id: data.task_id,
        from_user_id: data.from_user_id,
        to_user_id: data.to_user_id,
        reason: data.reason,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  getLogsByTaskId(task_id: number) {
    return db
      .selectFrom("task_ownership_log")
      .where("task_id", "=", task_id)
      .selectAll()
      .orderBy("changed_at", "asc") // chronological order for a history view
      .execute();
  }

  getLogById(id: number) {
    return db
      .selectFrom("task_ownership_log")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }
}
