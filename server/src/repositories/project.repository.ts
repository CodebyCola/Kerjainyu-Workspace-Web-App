import { db } from "../database";
import { Database, ProjectRole, ProjectStatus } from "../database/types";
import type { Kysely } from "kysely";

type Executor = Kysely<Database>;

export class ProjectRepository {
  async createProject(
    data: {
      title: string;
      status?: ProjectStatus;
      allow_free_swap?: boolean | null;
      deadline?: Date | null;
    },
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("projects")
      .values({
        title: data.title,
        status: data.status,
        deadline: data.deadline,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  async deleteProject(id: number) {
    return await db
      .deleteFrom("projects")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
  async updateProject(
    id: number,
    data: Partial<{
      title: string;
      status: ProjectStatus;
      allow_free_swap: boolean;
      deadline: Date | null;
      is_archived: boolean;
      archived_at: Date | null;
    }>,
  ) {
    return await db
      .updateTable("projects")
      .set({
        title: data.title,
        status: data.status,
        allow_free_swap: data.allow_free_swap,
        deadline: data.deadline,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async getProjectsByUser(userId: number, role?: ProjectRole) {
    let query = db
      .selectFrom("projects")
      .innerJoin("project_members", "project_members.project_id", "projects.id")
      .where("project_members.user_id", "=", userId)
      .where("project_members.status", "=", "active")
      .selectAll("projects");

    if (role) {
      query = query.where("project_members.role", "=", role);
    }
    return await query.execute();
  }
  async getProjectById(id: number, user_id: number) {
    return await db
      .selectFrom("projects")
      .where("id", "=", id)
      .where("id", "in", ({ selectFrom }) =>
        selectFrom("project_members")
          .select("project_id")
          .where("user_id", "=", user_id)
          .where("project_members.status", "=", "active"),
      )
      .selectAll()
      .executeTakeFirst();
  }
  async getProjectByTitle(title: string, user_id: number) {
    return await db
      .selectFrom("projects")
      .selectAll()
      .where("title", "=", title)
      .where("id", "in", ({ selectFrom }) =>
        selectFrom("project_members")
          .select("project_id")
          .where("user_id", "=", user_id)
          .where("project_members.status", "=", "active"),
      )
      .executeTakeFirst();
  }
}
