import { db } from "../database";
import { Database } from "../database/types";
import type { Kysely } from "kysely";

type Executor = Kysely<Database>;

export class ProjectLinkRepository {
  async create(
    project_id: number,
    data: { label: string; url: string },
    added_by: number,
  ) {
    return await db
      .insertInto("project_links")
      .values({
        project_id: project_id,
        label: data.label,
        url: data.url,
        added_by: added_by,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  async createMany(project_id: number, links: { label: string, url: string }[], added_by: number, executor: Executor = db) {
    return await db.insertInto('project_links').values(
      links.map(
        (link) => (
          {
            project_id,
            label: link.label,
            url: link.url,
            added_by: added_by
          }
        ))
    ).returningAll().execute()
  }
  async update(
    id: number,
    data: { label: string; url: string },
    project_id: number,
  ) {
    return await db
      .updateTable("project_links")
      .set({ label: data.label, url: data.url })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async getLinksByProject(project_id: number) {
    return await db
      .selectFrom("project_links")
      .selectAll()
      .where("project_id", "=", project_id)
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
