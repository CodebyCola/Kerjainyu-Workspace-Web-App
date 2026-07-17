import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'submission_pending'`.execute(
    db,
  );
  await sql`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'member_added'`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Intentionally a no-op — see comment above.
}
