import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";
import { CreateSubmissionAttachmentData } from "../types/submission-attachment";

type Executor = Kysely<Database>;

export class SubmissionAttachmentRepository {
  async createMany(
    submission_id: number,
    attachments: {
      type: CreateSubmissionAttachmentData["type"];
      content: string;
    }[],
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("submission_attachments")
      .values(
        attachments.map((a) => ({
          submission_id,
          type: a.type,
          content: a.content,
        })),
      )
      .returningAll()
      .execute();
  }

  async getBySubmission(submission_id: number) {
    return await db
      .selectFrom("submission_attachments")
      .where("submission_id", "=", submission_id)
      .selectAll()
      .execute();
  }

  async getByProject(project_id: number) {
    return await db
      .selectFrom("submission_attachments")
      .innerJoin(
        "task_submissions",
        "task_submissions.id",
        "submission_attachments.submission_id",
      )
      .innerJoin("tasks", "tasks.id", "task_submissions.task_id")
      .innerJoin("users", "users.id", "task_submissions.submitted_by")
      .where("tasks.project_id", "=", project_id)
      .select([
        "submission_attachments.id",
        "submission_attachments.submission_id",
        "submission_attachments.type",
        "submission_attachments.content",
        "submission_attachments.created_at",
        "task_submissions.task_id",
        "task_submissions.submitted_by",
        "tasks.title as task_title",
        "tasks.status as task_status",
        "users.username as submitted_by_username",
      ])
      .orderBy("submission_attachments.created_at", "desc")
      .execute();
  }

  async deleteBySubmission(submission_id: number, executor: Executor = db) {
    return await executor
      .deleteFrom("submission_attachments")
      .where("submission_id", "=", submission_id)
      .returningAll()
      .execute();
  }
}
