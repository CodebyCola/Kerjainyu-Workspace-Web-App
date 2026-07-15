import type { CreateProjectInput } from "@/service/project/project.validator";
import { getErrorMessage } from "@/utils/Errors";
import { differenceInCalendarDays } from "date-fns";

/**
 * Matches ProjectService's serializeProject() on the server
 * (server/src/services/project.service.ts) — `role` is the requesting
 * user's own membership role for this project (not a list of every
 * member's role), and `memberCount` is the active member count.
 * Neither is a raw `projects` table column; both are computed
 * per-viewer, which is why every endpoint here requires a session.
 */
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

/**
 * GET /projects — the server scopes this to projects the caller is an
 * active member of (see ProjectRepository.getProjectsByUser, which
 * inner-joins project_members on the session's user_id); there is no
 * "list all projects" mode, by design, so no user-supplied filter can
 * widen this beyond the caller's own memberships. `role` narrows
 * further to only the projects where the caller is a "leader" or
 * "member", client-side convenience over the same guarantee.
 */
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
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body: ProjectListApiResponse = await res.json();
  return body.data.projects;
}

/**
 * GET /projects/:projectId — the server's requireAuth + the
 * membership-scoped query (ProjectRepository.getProjectById joins on
 * the session's user_id) means a project the caller isn't a member of
 * comes back as a 404, not a 403 — this deliberately doesn't leak
 * whether the project even exists to a non-member.
 */
export async function getProjectById(
  projectId: number | string,
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body: ProjectApiResponse = await res.json();
  return body.data.project;
}

/**
 * POST /projects — the server assigns the creator as "leader" via
 * project_members inside the same transaction that inserts the
 * project (see ProjectService.createProject), so there's no separate
 * "add myself as leader" step here. `links`, when present, are
 * inserted in that same transaction too — the request body is passed
 * through as-is, so any links the caller attaches are created
 * alongside the project itself, not via a follow-up request.
 */
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
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
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
