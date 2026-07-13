import { type Kysely, sql } from "kysely";

/**
 * Creates every table defined in `src/database/types.ts`, matching it
 * field-for-field. Order follows FK dependency (users -> projects ->
 * project_members -> ... ) since a table referencing another must be
 * created after the table it references.
 *
 * Notable naming choices carried over exactly as types.ts has them,
 * not "corrected" to an earlier DBML version:
 *   - `tasks.assignee_id` (not `owner_id`)
 *   - `projects` has both `is_archived` (boolean) AND `is_archived_at`
 *     (timestamp) as separate columns
 *   - `project_links.category` is a new enum column
 *     (design/development/docs/other) not present in earlier versions
 *   - `ProjectStatus` is only "ongoing" | "completed" — archival is
 *     tracked via `is_archived`, not a third status value
 */
export async function up(db: Kysely<any>): Promise<void> {
  // ---- enums --------------------------------------------------------
  await db.schema
    .createType("project_status")
    .asEnum(["ongoing", "completed"])
    .execute();

  await db.schema
    .createType("project_role")
    .asEnum(["leader", "member"])
    .execute();

  await db.schema
    .createType("member_status")
    .asEnum(["invited", "active", "removed"])
    .execute();

  await db.schema
    .createType("task_status")
    .asEnum([
      "unclaimed",
      "todo",
      "ongoing",
      "submitted",
      "in_revision",
      "approved",
      "rejected",
    ])
    .execute();

  await db.schema
    .createType("ownership_change_reason")
    .asEnum(["assigned", "claimed", "swap", "reassigned"])
    .execute();

  await db.schema
    .createType("swap_request_status")
    .asEnum(["pending", "approved", "rejected", "cancelled"])
    .execute();

  await db.schema
    .createType("review_status")
    .asEnum(["pending", "approved", "revision_requested", "rejected"])
    .execute();

  await db.schema
    .createType("attachment_type")
    .asEnum(["text", "image", "file", "link"])
    .execute();

  await db.schema
    .createType("project_link_category")
    .asEnum(["design", "development", "docs", "other"])
    .execute();

  await db.schema
    .createType("appeal_status")
    .asEnum(["pending", "accepted", "rejected"])
    .execute();

  await db.schema
    .createType("notification_type")
    .asEnum([
      "deadline_reminder",
      "task_assigned",
      "task_swapped",
      "swap_requested",
      "submission_reviewed",
      "comment_added",
      "appeal_updated",
    ])
    .execute();

  // ---- users ------------------------------------------------------------
  await db.schema
    .createTable("users")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("username", "varchar", (col) => col.notNull().unique())
    .addColumn("password", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- projects -----------------------------------------------------
  await db.schema
    .createTable("projects")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("status", sql`project_status`, (col) =>
      col.notNull().defaultTo("ongoing"),
    )
    .addColumn("allow_free_swap", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("deadline", "timestamp")
    .addColumn("is_archived", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("is_archived_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- project_members ----------------------------------------------
  await db.schema
    .createTable("project_members")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("project_id", "integer", (col) =>
      col.notNull().references("projects.id").onDelete("cascade"),
    )
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("role", sql`project_role`, (col) =>
      col.notNull().defaultTo("member"),
    )
    .addColumn("joined_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("status", sql`member_status`, (col) =>
      col.notNull().defaultTo("active"),
    )
    .addUniqueConstraint("project_members_project_user_unique", [
      "project_id",
      "user_id",
    ])
    .execute();

  // ---- project_links --------------------------------------------------
  await db.schema
    .createTable("project_links")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("project_id", "integer", (col) =>
      col.notNull().references("projects.id").onDelete("cascade"),
    )
    .addColumn("label", "varchar", (col) => col.notNull())
    .addColumn("url", "varchar", (col) => col.notNull())
    .addColumn("category", sql`project_link_category`, (col) =>
      col.notNull().defaultTo("other"),
    )
    .addColumn("added_by", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- tasks --------------------------------------------------------
  await db.schema
    .createTable("tasks")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("status", sql`task_status`, (col) =>
      col.notNull().defaultTo("unclaimed"),
    )
    .addColumn("priority", "integer")
    .addColumn("display_order", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("project_id", "integer", (col) =>
      col.notNull().references("projects.id").onDelete("cascade"),
    )
    .addColumn("deadline", "timestamp")
    .addColumn("assignee_id", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("created_by", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("is_claimable", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamp")
    .execute();

  // ---- task_ownership_log --------------------------------------------
  await db.schema
    .createTable("task_ownership_log")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("task_id", "integer", (col) =>
      col.notNull().references("tasks.id").onDelete("cascade"),
    )
    .addColumn("from_user_id", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("to_user_id", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("reason", sql`ownership_change_reason`, (col) => col.notNull())
    .addColumn("changed_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- task_swap_requests --------------------------------------------
  await db.schema
    .createTable("task_swap_requests")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("task_id", "integer", (col) =>
      col.notNull().references("tasks.id").onDelete("cascade"),
    )
    .addColumn("target_task_id", "integer", (col) =>
      col.references("tasks.id").onDelete("cascade"),
    )
    .addColumn("requested_by", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("requested_to", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("status", sql`swap_request_status`, (col) =>
      col.notNull().defaultTo("pending"),
    )
    .addColumn("resolved_by", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("resolved_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- task_submissions -----------------------------------------------
  await db.schema
    .createTable("task_submissions")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("task_id", "integer", (col) =>
      col.notNull().references("tasks.id").onDelete("cascade"),
    )
    .addColumn("submitted_by", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("note", "varchar")
    .addColumn("review_status", sql`review_status`, (col) =>
      col.notNull().defaultTo("pending"),
    )
    .addColumn("review_note", "varchar")
    .addColumn("reviewed_by", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("reviewed_at", "timestamp")
    .addColumn("submitted_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- submission_attachments ------------------------------------------
  await db.schema
    .createTable("submission_attachments")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("submission_id", "integer", (col) =>
      col.notNull().references("task_submissions.id").onDelete("cascade"),
    )
    .addColumn("type", sql`attachment_type`, (col) => col.notNull())
    .addColumn("content", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- task_appeals -------------------------------------------------
  await db.schema
    .createTable("task_appeals")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("task_id", "integer", (col) =>
      col.notNull().references("tasks.id").onDelete("cascade"),
    )
    .addColumn("submission_id", "integer", (col) =>
      col.references("task_submissions.id").onDelete("set null"),
    )
    .addColumn("raised_by", "integer", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("reason", "varchar", (col) => col.notNull())
    .addColumn("status", sql`appeal_status`, (col) =>
      col.notNull().defaultTo("pending"),
    )
    .addColumn("resolved_by", "integer", (col) =>
      col.references("users.id").onDelete("set null"),
    )
    .addColumn("resolution_note", "varchar")
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("resolved_at", "timestamp")
    .execute();

  // ---- comments_task --------------------------------------------------
  await db.schema
    .createTable("comments_task")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("task_id", "integer", (col) =>
      col.notNull().references("tasks.id").onDelete("cascade"),
    )
    .addColumn("comment", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // ---- notifications --------------------------------------------------
  await db.schema
    .createTable("notifications")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("type", sql`notification_type`, (col) => col.notNull())
    .addColumn("reference_type", "varchar")
    .addColumn("reference_id", "integer")
    .addColumn("message", "varchar", (col) => col.notNull())
    .addColumn("is_read", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

/**
 * Drops everything in reverse dependency order — tables that reference
 * others must be dropped before the tables they reference.
 */
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("notifications").execute();
  await db.schema.dropTable("comments_task").execute();
  await db.schema.dropTable("task_appeals").execute();
  await db.schema.dropTable("submission_attachments").execute();
  await db.schema.dropTable("task_submissions").execute();
  await db.schema.dropTable("task_swap_requests").execute();
  await db.schema.dropTable("task_ownership_log").execute();
  await db.schema.dropTable("tasks").execute();
  await db.schema.dropTable("project_links").execute();
  await db.schema.dropTable("project_members").execute();
  await db.schema.dropTable("projects").execute();
  await db.schema.dropTable("users").execute();

  await db.schema.dropType("notification_type").execute();
  await db.schema.dropType("appeal_status").execute();
  await db.schema.dropType("project_link_category").execute();
  await db.schema.dropType("attachment_type").execute();
  await db.schema.dropType("review_status").execute();
  await db.schema.dropType("swap_request_status").execute();
  await db.schema.dropType("ownership_change_reason").execute();
  await db.schema.dropType("task_status").execute();
  await db.schema.dropType("member_status").execute();
  await db.schema.dropType("project_role").execute();
  await db.schema.dropType("project_status").execute();
}
