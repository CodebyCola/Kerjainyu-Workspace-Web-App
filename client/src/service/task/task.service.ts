import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
} from "date-fns";
import type { Task as CalendarTask } from "@/components/calendar/MonthCalendar";
import type { TaskStatus } from "@/components/taskboard/TaskCard";
import type { CreateTaskInput } from "@/service/task/task.validator";
import { getInitials } from "@/utils/Avatar";
import { parseApiError } from "@/utils/Errors";
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

// Taskboard
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number | null;
  display_order: number;
  project_id: number;
  deadline: string | null;
  assignee_id: number | null;
  assignee_username: string | null;
  created_by: number;
  is_claimable: boolean;
  created_at: string;
  updated_at: string | null;
}

interface TaskListApiResponse {
  success: true;
  data: { tasks: Task[] };
}

interface TaskApiResponse {
  success: true;
  data: { task: Task };
}

export async function getTasks(projectId: number | string): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: TaskListApiResponse = await res.json();
  return body.data.tasks;
}

export async function getTaskById(
  projectId: number | string,
  taskId: number | string,
): Promise<Task> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: TaskApiResponse = await res.json();
  return body.data.task;
}

export async function createTask(
  projectId: number | string,
  data: CreateTaskInput,
): Promise<Task> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      deadline: data.deadline ? data.deadline.toISOString() : undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: TaskApiResponse = await res.json();
  return body.data.task;
}

export async function claimTask(
  projectId: number | string,
  taskId: number | string,
): Promise<Task> {
  const res = await fetch(
    `${BASE_URL}/projects/${projectId}/tasks/${taskId}/claim`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: TaskApiResponse = await res.json();
  return body.data.task;
}

export async function startTask(
  projectId: number | string,
  taskId: number | string,
): Promise<Task> {
  const res = await fetch(
    `${BASE_URL}/projects/${projectId}/tasks/${taskId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ongoing" }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: TaskApiResponse = await res.json();
  return body.data.task;
}

export function toCalendarTask(task: Task): CalendarTask {
  return {
    id: String(task.id),
    title: task.title,
    status: task.status,
    deadline: task.deadline
      ? format(new Date(task.deadline), "yyyy-MM-dd")
      : null,
    ownerInitials: task.assignee_id
      ? getInitials(task.assignee_username)
      : undefined,
  };
}
