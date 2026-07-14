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

  async deleteBySubmission(submission_id: number, executor: Executor = db) {
    return await executor
      .deleteFrom("submission_attachments")
      .where("submission_id", "=", submission_id)
      .returningAll()
      .execute();
  }
}
