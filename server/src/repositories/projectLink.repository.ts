import { db } from "../database";
import { ProjectLinkCategory } from "../database/types";

export class ProjectLinkRepository {
  async create(
    project_id: number,
    data: { label: string; url: string; category: ProjectLinkCategory },
    added_by: number,
  ) {
    return await db
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
  async update(
    id: number,
    data: { label: string; url: string; category: ProjectLinkCategory },
    project_id: number,
  ) {
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
