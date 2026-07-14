import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";
import { CreateCommentData } from "../types/comment";

type Executor = Kysely<Database>;

export class CommentRepository {
  async create(data: CreateCommentData, executor: Executor = db) {
    return await executor
      .insertInto("comments_task")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getByTask(task_id: number) {
    return await db
      .selectFrom("comments_task")
      .innerJoin("users", "users.id", "comments_task.user_id")
      .where("comments_task.task_id", "=", task_id)
      .select([
        "comments_task.id",
        "comments_task.comment",
        "comments_task.created_at",
        "users.id as user_id",
        "users.username",
      ])
      .orderBy("comments_task.created_at", "asc")
      .execute();
  }

  async getById(id: number, task_id: number) {
    return await db
      .selectFrom("comments_task")
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .selectAll()
      .executeTakeFirst();
  }

  async delete(id: number, task_id: number, executor: Executor = db) {
    return await executor
      .deleteFrom("comments_task")
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .returningAll()
      .executeTakeFirst();
  }
}