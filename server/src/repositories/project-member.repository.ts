import { db } from "../database";
import type { Kysely } from "kysely";
import type { Database, ProjectRole } from "../database/types";

type Executor = Kysely<Database>;

export class ProjectMemberRepository {
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

  async findByProjectAndUser(project_id: number, user_id: number) {
    return await db
      .selectFrom("project_members")
      .where("project_id", "=", project_id)
      .where("user_id", "=", user_id)
      .where("status", "=", "active")
      .selectAll()
      .executeTakeFirst();
  }

  async listActiveMembers(project_id: number) {
    return await db
      .selectFrom("project_members")
      .innerJoin("users", "users.id", "project_members.user_id")
      .where("project_members.project_id", "=", project_id)
      .where("project_members.status", "=", "active")
      .select([
        "users.id",
        "users.username",
        "project_members.role",
        "project_members.joined_at",
      ])
      .execute();
  }

  async removeMember(project_id: number, user_id: number) {
    return await db
      .updateTable("project_members")
      .set({ status: "removed" })
      .where("project_id", "=", project_id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();
  }
  async demoteToMember(
    project_id: number,
    user_id: number,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("project_members")
      .set({ role: "member" })
      .where("project_id", "=", project_id)
      .where("user_id", "=", user_id)
      .executeTakeFirst();
  }
  async promoteToLeader(
    project_id: number,
    user_id: number,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("project_members")
      .set({ role: "leader" })
      .where("project_id", "=", project_id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();
  }
}
