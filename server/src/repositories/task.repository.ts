import { db } from "../database";
import { TaskStatus } from "../database/types";
import { Database } from "../database/types";
import type { Kysely } from "kysely";
import { CreateTaskData, UpdateTaskData } from "../types/task";

type Executor = Kysely<Database>;

export class TaskRepository {
  async getTasksByProject(project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("project_id", "=", project_id)
      .selectAll()
      .execute();
  }
  async getTaskById(id: number, project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }

  async getTaskByTitle(title: string, project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("title", "=", title)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }

  async getClaimableTasks(project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("project_id", "=", project_id)
      .where("status", "=", "unclaimed")
      .where("is_claimable", "=", true)
      .selectAll()
      .execute();
  }

  async getTaskByAssignee(assignee_id: number, project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("project_id", "=", project_id)
      .where("assignee_id", "=", assignee_id)
      .selectAll()
      .execute();
  }

  async create(
    project_id: number,
    data: CreateTaskData,
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("tasks")
      .values({ project_id: project_id, ...data })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async claimTask(
    id: number,
    user_id: number,
    project_id: number,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("tasks")
      .set({ status: "todo", assignee_id: user_id })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .where("status", "=", "unclaimed")
      .where("is_claimable", "=", true)
      .returningAll()
      .executeTakeFirst();
  }

  async updateTask(
    id: number,
    data: UpdateTaskData,
    project_id: number,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("tasks")
      .set(data)
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async updateTaskStatus(id: number, project_id: number, status: TaskStatus) {
    return await db
      .updateTable("tasks")
      .set({ status: status })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async deleteTask(id: number, project_id: number) {
    return await db
      .deleteFrom("tasks")
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
}
