import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database, ProjectRole } from "../database/types";

type Executor = Kysely<Database>;

export class ProjectMembersRepository {
  async create(
    data: { project_id: number; user_id: number; role: ProjectRole },
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("project_members")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findByProjectAndUser(projectId: number, userId: number) {
    return await db
      .selectFrom("project_members")
      .where("project_id", "=", projectId)
      .where("user_id", "=", userId)
      .where("status", "=", "active")
      .selectAll()
      .executeTakeFirst();
  }

  async listActiveMembers(projectId: number) {
    return await db
      .selectFrom("project_members")
      .innerJoin("users", "users.id", "project_members.user_id")
      .where("project_members.project_id", "=", projectId)
      .where("project_members.status", "=", "active")
      .select([
        "users.id",
        "users.username",
        "project_members.role",
        "project_members.joined_at",
      ])
      .execute();
  }

  async removeMember(projectId: number, userId: number) {
    return await db
      .updateTable("project_members")
      .set({ status: "removed" })
      .where("project_id", "=", projectId)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();
  }
}
