import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
} from "date-fns";
import type { TaskStatus } from "@/components/taskboard/TaskCard";
import { parseApiError } from "@/utils/Errors";

/**
 * Matches the row shape returned by GET /projects/tasks/mine on the
 * server (TaskRepository.getTaskByAssigneeAcrossProjects) — a task
 * row plus `project_title` from the joined `projects` table, since
 * My Tasks spans every project the user belongs to and each row needs
 * to say which project it came from.
 */
export interface MyTask {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number | null;
  deadline: string | null;
  project_id: number;
  project_title: string;
  assignee_id: number | null;
  created_by: number;
  is_claimable: boolean;
  created_at: string;
  updated_at: string | null;
}

interface MyTasksApiResponse {
  success: true;
  data: { tasks: MyTask[] };
}

/** Mirrors MyTaskSort on the server (task.repository.ts) — keep in sync. */
export type MyTaskSort =
  | "deadline_asc"
  | "deadline_desc"
  | "priority"
  | "recent";

export interface GetMyTasksParams {
  status?: TaskStatus | "all";
  sort?: MyTaskSort;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /projects/tasks/mine — cross-project, unlike the per-project
 * `/projects/:projectId/tasks/mine` used on Task Board. Status and
 * sort are sent as query params and applied by the server's SQL query
 * (see TaskRepository.getTaskByAssigneeAcrossProjects), not filtered
 * client-side — this keeps the response small and avoids shipping
 * rows the user is just going to have hidden from them anyway, and
 * lets the database do the sorting with an index instead of Array.sort
 * running in the browser on every filter change.
 */
export async function getMyTasks(
  params: GetMyTasksParams = {},
): Promise<MyTask[]> {
  const url = new URL(`${BASE_URL}/projects/tasks/mine`);
  if (params.status && params.status !== "all") {
    url.searchParams.set("status", params.status);
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: MyTasksApiResponse = await res.json();
  return body.data.tasks;
}

/**
 * Turns an ISO deadline into the short relative/absolute label the UI
 * expects ("Today", "Tomorrow", or "Oct 18"). Mirrors the labels the
 * table previously hardcoded, now derived instead of hand-authored.
 */
export function formatDeadlineLabel(
  deadline: string | null,
): string | undefined {
  if (!deadline) return undefined;
  const date = new Date(deadline);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

/** true when a deadline is today or already overdue and the task isn't done yet. */
export function isTaskUrgent(
  task: Pick<MyTask, "deadline" | "status">,
): boolean {
  if (!task.deadline) return false;
  if (task.status === "approved" || task.status === "rejected") return false;
  return differenceInCalendarDays(new Date(task.deadline), new Date()) <= 0;
}

const PRIORITY_LABELS: Record<number, string> = {
  1: "High",
  2: "Medium",
  3: "Low",
};

/** Priority is stored as a small int (1 = highest); the table shows a word instead. */
export function formatPriorityLabel(
  priority: number | null,
): string | undefined {
  if (priority == null) return undefined;
  return PRIORITY_LABELS[priority] ?? `P${priority}`;
}
