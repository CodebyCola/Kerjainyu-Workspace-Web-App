import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database, AppealStatus } from "../database/types";
import {
  CreateTaskAppealData,
  UpdateTaskAppealData,
} from "../types/task-appeal";

type Executor = Kysely<Database>;

export class TaskAppealRepository {
  async create(data: CreateTaskAppealData, executor: Executor = db) {
    return await executor
      .insertInto("task_appeals")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async resolve(
    id: number,
    task_id: number,
    data: UpdateTaskAppealData,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("task_appeals")
      .set(data)
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .returningAll()
      .executeTakeFirst();
  }

  async getById(id: number, task_id: number) {
    return await db
      .selectFrom("task_appeals")
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .selectAll()
      .executeTakeFirst();
  }

  async getAllByTask(task_id: number) {
    return await db
      .selectFrom("task_appeals")
      .where("task_id", "=", task_id)
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();
  }

  async getPendingByTask(task_id: number) {
    return await db
      .selectFrom("task_appeals")
      .where("task_id", "=", task_id)
      .where("status", "=", "pending")
      .selectAll()
      .execute();
  }

  async getByProject(project_id: number, status?: AppealStatus) {
    let query = db
      .selectFrom("task_appeals")
      .innerJoin("tasks", "tasks.id", "task_appeals.task_id")
      .where("tasks.project_id", "=", project_id)
      .selectAll("task_appeals")
      .orderBy("task_appeals.created_at", "desc");

    if (status) {
      query = query.where("task_appeals.status", "=", status);
    }
    return await query.execute();
  }
}
