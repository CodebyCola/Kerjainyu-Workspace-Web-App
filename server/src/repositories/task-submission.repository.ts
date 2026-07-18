import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";
import {
  CreateTaskSubmissionData,
  UpdateTaskSubmissionData,
} from "../types/task-submission";

type Executor = Kysely<Database>;

export class TaskSubmissionRepository {
  async create(data: CreateTaskSubmissionData, executor: Executor = db) {
    return await executor
      .insertInto("task_submissions")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async review(
    id: number,
    task_id: number,
    data: UpdateTaskSubmissionData,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("task_submissions")
      .set(data)
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .returningAll()
      .executeTakeFirst();
  }

  async getById(id: number, task_id: number) {
    return await db
      .selectFrom("task_submissions")
      .where("id", "=", id)
      .where("task_id", "=", task_id)
      .selectAll()
      .executeTakeFirst();
  }

  async getLatestByTask(task_id: number) {
    return await db
      .selectFrom("task_submissions")
      .innerJoin(
        "users as submitter",
        "submitter.id",
        "task_submissions.submitted_by",
      )
      .leftJoin(
        "users as reviewer",
        "reviewer.id",
        "task_submissions.reviewed_by",
      )
      .where("task_id", "=", task_id)
      .selectAll("task_submissions")
      .select([
        "submitter.username as submitted_by_username",
        "reviewer.username as reviewed_by_username",
      ])
      .orderBy("submitted_at", "desc")
      .executeTakeFirst();
  }

  async getAllByTask(task_id: number) {
    return await db
      .selectFrom("task_submissions")
      .innerJoin(
        "users as submitter",
        "submitter.id",
        "task_submissions.submitted_by",
      )
      .leftJoin(
        "users as reviewer",
        "reviewer.id",
        "task_submissions.reviewed_by",
      )
      .where("task_id", "=", task_id)
      .selectAll("task_submissions")
      .select([
        "submitter.username as submitted_by_username",
        "reviewer.username as reviewed_by_username",
      ])
      .orderBy("submitted_at", "asc")
      .execute();
  }

  async getPendingByProject(project_id: number) {
    return await db
      .selectFrom("task_submissions")
      .innerJoin("tasks", "tasks.id", "task_submissions.task_id")
      .where("tasks.project_id", "=", project_id)
      .where("task_submissions.review_status", "=", "pending")
      .selectAll("task_submissions")
      .orderBy("task_submissions.submitted_at", "asc")
      .execute();
  }
}
