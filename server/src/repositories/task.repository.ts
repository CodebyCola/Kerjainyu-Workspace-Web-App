import { db } from "../database";
import { TaskStatus } from "../database/types";
import { Database } from "../database/types";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { CreateTaskData, UpdateTaskData } from "../types/task";

type Executor = Kysely<Database>;

/** Accepted values for `GET /projects/tasks/mine?sort=` — see getTaskByAssigneeAcrossProjects. */
export type MyTaskSort =
  | "deadline_asc"
  | "deadline_desc"
  | "priority"
  | "recent";

export interface MyTaskFilters {
  status?: TaskStatus;
  sort?: MyTaskSort;
}

export class TaskRepository {
  async getTasksByProject(project_id: number) {
    return await db
      .selectFrom("tasks")
      .leftJoin("users", "users.id", "tasks.assignee_id")
      .where("tasks.project_id", "=", project_id)
      .select([
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.priority",
        "tasks.display_order",
        "tasks.project_id",
        "tasks.deadline",
        "tasks.assignee_id",
        "tasks.created_by",
        "tasks.is_claimable",
        "tasks.created_at",
        "tasks.updated_at",

        "users.username as assignee_username",
      ])
      .execute();
  }
  async getTaskById(id: number, project_id: number) {
    return await db
      .selectFrom("tasks")
      .leftJoin("users", "users.id", "tasks.assignee_id")
      .where("tasks.id", "=", id)
      .where("tasks.project_id", "=", project_id)
      .select([
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.priority",
        "tasks.display_order",
        "tasks.project_id",
        "tasks.deadline",
        "tasks.assignee_id",
        "tasks.created_by",
        "tasks.is_claimable",
        "tasks.created_at",
        "tasks.updated_at",

        "users.username as assignee_username",
      ])
      .executeTakeFirst();
  }

  async getTaskByTitle(title: string, project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("title", "=", title)
      .where("project_id", "=", project_id)
      .selectAll()
      .executeTakeFirst();
  }

  async getClaimableTasks(project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("project_id", "=", project_id)
      .where("status", "=", "unclaimed")
      .where("is_claimable", "=", true)
      .selectAll()
      .execute();
  }

  async getTaskByAssignee(assignee_id: number, project_id: number) {
    return await db
      .selectFrom("tasks")
      .where("project_id", "=", project_id)
      .where("assignee_id", "=", assignee_id)
      .selectAll()
      .execute();
  }

  async getTaskByAssigneeAcrossProjects(
    assignee_id: number,
    filters: MyTaskFilters = {},
  ) {
    let query = db
      .selectFrom("tasks")
      .innerJoin("projects", "projects.id", "tasks.project_id")
      .innerJoin("project_members", (join) =>
        join
          .onRef("project_members.project_id", "=", "tasks.project_id")
          .on("project_members.user_id", "=", assignee_id)
          .on("project_members.status", "=", "active"),
      )
      .where("tasks.assignee_id", "=", assignee_id)
      .select([
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.priority",
        "tasks.deadline",
        "tasks.project_id",
        "tasks.assignee_id",
        "tasks.created_by",
        "tasks.is_claimable",
        "tasks.created_at",
        "tasks.updated_at",
        "projects.title as project_title",
      ]);

    if (filters.status) {
      query = query.where("tasks.status", "=", filters.status);
    }

    switch (filters.sort) {
      case "deadline_desc":
        query = query
          .orderBy(sql`tasks.deadline IS NULL`)
          .orderBy("tasks.deadline", "desc");
        break;
      case "priority":
        query = query
          .orderBy(sql`tasks.priority IS NULL`)
          .orderBy("tasks.priority", "asc");
        break;
      case "recent":
        query = query.orderBy("tasks.created_at", "desc");
        break;
      default:
        query = query
          .orderBy(sql`tasks.deadline IS NULL`)
          .orderBy("tasks.deadline", "asc");
        break;
    }

    return await query.execute();
  }

  async create(
    project_id: number,
    data: CreateTaskData,
    executor: Executor = db,
  ) {
    return await executor
      .insertInto("tasks")
      .values({ project_id: project_id, ...data })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async claimTask(
    id: number,
    user_id: number,
    project_id: number,
    executor: Executor = db,
  ) {
    const updated = await executor
      .updateTable("tasks")
      .set({
        status: "todo",
        assignee_id: user_id,
      })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .where("status", "=", "unclaimed")
      .where("is_claimable", "=", true)
      .returning("id")
      .executeTakeFirst();

    if (!updated) return undefined;

    return await executor
      .selectFrom("tasks")
      .leftJoin("users", "users.id", "tasks.assignee_id")
      .where("tasks.id", "=", updated.id)
      .where("tasks.project_id", "=", project_id)
      .select([
        "tasks.id",
        "tasks.title",
        "tasks.description",
        "tasks.status",
        "tasks.priority",
        "tasks.display_order",
        "tasks.project_id",
        "tasks.deadline",
        "tasks.assignee_id",
        "tasks.created_by",
        "tasks.is_claimable",
        "tasks.created_at",
        "tasks.updated_at",

        "users.username as assignee_username",
      ])
      .executeTakeFirst();
  }

  async updateTask(
    id: number,
    data: UpdateTaskData,
    project_id: number,
    executor: Executor = db,
  ) {
    return await executor
      .updateTable("tasks")
      .set(data)
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async updateTaskStatus(id: number, project_id: number, status: TaskStatus) {
    return await db
      .updateTable("tasks")
      .set({ status: status })
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
  async deleteTask(id: number, project_id: number) {
    return await db
      .deleteFrom("tasks")
      .where("id", "=", id)
      .where("project_id", "=", project_id)
      .returningAll()
      .executeTakeFirst();
  }
}
