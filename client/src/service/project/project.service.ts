import type { CreateProjectInput } from "@/service/project/project.validator";
import { parseApiError } from "@/utils/Errors";
import { differenceInCalendarDays } from "date-fns";

export interface Project {
  id: number;
  title: string;
  status: "ongoing" | "completed";
  allow_free_swap: boolean;
  deadline: string | null;
  is_archived: boolean;
  is_archived_at: string | null;
  created_at: string;
  role: "leader" | "member";
  memberCount: number;
}

interface ProjectListApiResponse {
  success: true;
  data: { projects: Project[] };
}

interface ProjectApiResponse {
  success: true;
  data: { project: Project };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProjects(
  role?: "leader" | "member",
): Promise<Project[]> {
  const url = new URL(`${BASE_URL}/projects`);
  if (role) {
    url.searchParams.set("role", role);
  }

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: ProjectListApiResponse = await res.json();
  return body.data.projects;
}

export async function getProjectById(
  projectId: number | string,
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: ProjectApiResponse = await res.json();
  return body.data.project;
}

export async function createProject(
  data: CreateProjectInput,
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects`, {
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

  const body: ProjectApiResponse = await res.json();
  return body.data.project;
}


export function isProjectUrgent(project: Project): boolean {
  if (!project.deadline || project.status === "completed") return false;
  const daysLeft = differenceInCalendarDays(
    new Date(project.deadline),
    new Date(),
  );
  return daysLeft < 4;
}