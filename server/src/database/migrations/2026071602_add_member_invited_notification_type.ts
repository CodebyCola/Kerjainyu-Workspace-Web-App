import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'member_invited'`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // No-op — see 2026071601's down() for why enum values aren't reversed here.
}
