import { db } from "../database";
import { Database, ProjectRole, ProjectStatus } from "../database/types";
import type { Kysely } from "kysely";
import { CreateProjectData, UpdateProjectData } from "../types/project";
type Executor = Kysely<Database>;

export class ProjectRepository {
  async createProject(data: CreateProjectData, executor: Executor = db) {
    return await executor
      .insertInto("projects")
      .values({
        title: data.title,
        status: data.status,
        deadline: data.deadline,
        allow_free_swap: data.allow_free_swap,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  async deleteProject(id: number, user_id: number) {
    return await db
      .deleteFrom("projects")
      .where("id", "=", id)
      .where("id", "in", ({ selectFrom }) =>
        selectFrom("project_members")
          .select("project_id")
          .where("user_id", "=", user_id)
          .where("role", "=", "leader")
          .where("project_members.status", "=", "active"),
      )
      .returningAll()
      .executeTakeFirst();
  }
  async updateProject(id: number, user_id: number, data: UpdateProjectData) {
    return await db
      .updateTable("projects")
      .set({
        title: data.title,
        status: data.status,
        allow_free_swap: data.allow_free_swap,
        deadline: data.deadline,
        is_archived: data.is_archived,
        is_archived_at: data.is_archived_at,
      })
      .where("id", "=", id)
      .where("id", "in", ({ selectFrom }) =>
        selectFrom("project_members")
          .select("project_id")
          .where("user_id", "=", user_id)
          .where("role", "=", "leader")
          .where("project_members.status", "=", "active"),
      )
      .returningAll()
      .executeTakeFirst();
  }

  async getById(id: number) {
    return await db
      .selectFrom("projects")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();
  }

  async getProjectsByUser(userId: number, role?: ProjectRole) {
    let query = db
      .selectFrom("projects")
      .innerJoin("project_members", "project_members.project_id", "projects.id")
      .where("project_members.user_id", "=", userId)
      .where("project_members.status", "=", "active")
      .select((eb) => [
        ...([
          "projects.id",
          "projects.title",
          "projects.status",
          "projects.allow_free_swap",
          "projects.deadline",
          "projects.is_archived",
          "projects.is_archived_at",
          "projects.created_at",
        ] as const),
        "project_members.role as viewer_role",
        eb
          .selectFrom("project_members as pm")
          .whereRef("pm.project_id", "=", "projects.id")
          .where("pm.status", "=", "active")
          .select((eb2) => eb2.fn.countAll().as("count"))
          .as("member_count"),
      ]);

    if (role) {
      query = query.where("project_members.role", "=", role);
    }
    return await query.execute();
  }
  async getProjectById(id: number, user_id: number) {
    return await db
      .selectFrom("projects")
      .innerJoin("project_members", (join) =>
        join
          .onRef("project_members.project_id", "=", "projects.id")
          .on("project_members.user_id", "=", user_id)
          .on("project_members.status", "=", "active"),
      )
      .where("projects.id", "=", id)
      .select((eb) => [
        ...([
          "projects.id",
          "projects.title",
          "projects.status",
          "projects.allow_free_swap",
          "projects.deadline",
          "projects.is_archived",
          "projects.is_archived_at",
          "projects.created_at",
        ] as const),
        "project_members.role as viewer_role",
        eb
          .selectFrom("project_members as pm")
          .whereRef("pm.project_id", "=", "projects.id")
          .where("pm.status", "=", "active")
          .select((eb2) => eb2.fn.countAll().as("count"))
          .as("member_count"),
      ])
      .executeTakeFirst();
  }
  async getProjectByTitle(title: string, user_id: number) {
    return await db
      .selectFrom("projects")
      .innerJoin("project_members", (join) =>
        join
          .onRef("project_members.project_id", "=", "projects.id")
          .on("project_members.user_id", "=", user_id)
          .on("project_members.status", "=", "active"),
      )
      .where("projects.title", "=", title)
      .select((eb) => [
        ...([
          "projects.id",
          "projects.title",
          "projects.status",
          "projects.allow_free_swap",
          "projects.deadline",
          "projects.is_archived",
          "projects.is_archived_at",
          "projects.created_at",
        ] as const),
        "project_members.role as viewer_role",
        eb
          .selectFrom("project_members as pm")
          .whereRef("pm.project_id", "=", "projects.id")
          .where("pm.status", "=", "active")
          .select((eb2) => eb2.fn.countAll().as("count"))
          .as("member_count"),
      ])
      .executeTakeFirst();
  }
}
