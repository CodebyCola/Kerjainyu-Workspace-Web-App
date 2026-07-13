import { db } from "../database";
import { TaskStatus } from "../database/types";

import { CreateTaskData, UpdateTaskData } from "../types/task";

export class TaskRepository {
  async create(project_id: number, data: CreateTaskData) {
    return await db
      .insertInto("tasks")
      .values({ project_id: project_id, ...data })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async claimTask(id: number, user_id: number) {
    return await db
      .updateTable("tasks")
      .set({ assignee_id: user_id })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateTask(id: number, data: UpdateTaskData) {
    return await db
      .updateTable("tasks")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteTask(id: number) {
    return await db
      .deleteFrom("tasks")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}
