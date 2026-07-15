import { db } from "../database";
import { Database } from "../database/types";
import type { Kysely } from "kysely";
import {
  CreateProjectLinkData,
  UpdateProjectLinkData,
} from "../types/project-link";
type Executor = Kysely<Database>;

export class ProjectLinkRepository {
  async create(
    project_id: number,
    data: CreateProjectLinkData,
    added_by: number,
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("project_links")
      .values({
        project_id: project_id,
        label: data.label,
        url: data.url,
        category: data.category,
        added_by: added_by,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  async createMany(
    project_id: number,
    links: CreateProjectLinkData[],
    added_by: number,
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("project_links")
      .values(
        links.map((link) => ({
          project_id,
          label: link.label,
          url: link.url,
          category: link.category,
          added_by: added_by,
        })),
      )
      .returningAll()
      .execute();
  }
  async update(id: number, data: UpdateProjectLinkData, project_id: number) {
    return await db
      .updateTable("project_links")
      .set({ label: data.label, url: data.url, category: data.category })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async getLinksByProject(project_id: number) {
    return await db
      .selectFrom("project_links")
      .leftJoin("users", "users.id", "project_links.added_by")
      .where("project_links.project_id", "=", project_id)
      .select([
        "project_links.id",
        "project_links.project_id",
        "project_links.label",
        "project_links.url",
        "project_links.category",
        "project_links.added_by",
        "project_links.created_at",
        "users.username as added_by_username",
      ])
      .execute();
  }
  async getLinkById(id: number, project_id: number) {
    return await db
      .selectFrom("project_links")
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }
  async getLinkByLabel(label: string, project_id: number) {
    return await db
      .selectFrom("project_links")
      .where("label", "=", label)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }
  async getLinkByUrl(url: string, project_id: number) {
    return await db
      .selectFrom("project_links")
      .where("url", "=", url)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }
  async deleteLink(id: number, project_id: number) {
    return await db
      .deleteFrom("project_links")
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
}
