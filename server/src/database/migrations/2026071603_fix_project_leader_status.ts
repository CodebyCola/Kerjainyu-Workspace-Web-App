import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("project_members")
    .set({ status: "active" })
    .where("role", "=", "leader")
    .where("status", "=", "invited")
    .execute();
}
export async function down(db: Kysely<any>): Promise<void> {
  // Intentionally a no-op — see comment above.
}
