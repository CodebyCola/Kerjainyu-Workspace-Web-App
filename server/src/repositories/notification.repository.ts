import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";
import { CreateNotificationData } from "../types/notification";

type Executor = Kysely<Database>;

export class NotificationRepository {
  // Deliberately defaults to the plain `db`, not a transaction — see the
  // note in NotificationService. The `executor` param still exists in case
  // a caller has a specific reason to include it in a transaction anyway.
  async create(data: CreateNotificationData, executor: Executor = db) {
    return await executor
      .insertInto("notifications")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getByUser(user_id: number, unreadOnly = false, limit = 50, offset = 0) {
    let query = db
      .selectFrom("notifications")
      .where("user_id", "=", user_id)
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (unreadOnly) {
      query = query.where("is_read", "=", false);
    }
    return await query.execute();
  }

  async getUnreadCount(user_id: number) {
    const result = await db
      .selectFrom("notifications")
      .where("user_id", "=", user_id)
      .where("is_read", "=", false)
      .select((eb) => eb.fn.countAll().as("count"))
      .executeTakeFirst();
    return Number(result?.count ?? 0);
  }

  // Scoped by user_id — critical here, not just IDOR hygiene: without this,
  // any logged-in user could mark (or later, read) someone else's notification
  // just by guessing a sequential id.
  async markAsRead(id: number, user_id: number) {
    return await db
      .updateTable("notifications")
      .set({ is_read: true })
      .where("id", "=", id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();
  }

  async markAllAsRead(user_id: number) {
    return await db
      .updateTable("notifications")
      .set({ is_read: true })
      .where("user_id", "=", user_id)
      .where("is_read", "=", false)
      .execute();
  }
}