import type { CreateResourceLinkInput } from "@/service/resources/resources.validator";
import { parseApiError } from "@/utils/Errors";

/**
 * Matches ProjectLinksTable (server/src/database/types.ts) plus
 * `addedByUsername` — the username of whoever added the link,
 * resolved server-side via a left join on `users` (ProjectLinkService
 * .getAllLinksByProject). `added_by` can be null if that user's
 * account was later deleted (project_links.added_by is ON DELETE SET
 * NULL), in which case addedByUsername is null too.
 */
export interface ResourceLink {
  id: number;
  project_id: number;
  label: string;
  url: string;
  category: "design" | "development" | "docs" | "other";
  added_by: number | null;
  addedByUsername: string | null;
  created_at: string;
}

interface ResourceLinkListApiResponse {
  success: true;
  data: { links: ResourceLink[] };
}

interface ResourceLinkApiResponse {
  success: true;
  data: { link: ResourceLink };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /projects/:projectId/links — guarded by requireProjectRole("leader",
 * "member") on the server (see project-link.routes.ts), so this 403s
 * for anyone who isn't an active member of the project, and the
 * project itself is never leaked to non-members through this route.
 */
export async function getProjectLinks(
  projectId: number | string,
): Promise<ResourceLink[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/links`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: ResourceLinkListApiResponse = await res.json();
  return body.data.links;
}

/**
 * POST /projects/:projectId/links — same role guard as the list
 * endpoint. Unlike creating links alongside a new project (which
 * accepts an array via POST /projects), this only ever takes one
 * link per request — there's no bulk-add endpoint for an existing
 * project, so adding several means calling this once per link.
 */
export async function createProjectLink(
  projectId: number | string,
  data: CreateResourceLinkInput,
): Promise<ResourceLink> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/links`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: ResourceLinkApiResponse = await res.json();
  return body.data.link;
}

/**
 * PATCH /projects/:projectId/links/:linkId — restricted to
 * requireProjectRole("leader") on the server, stricter than list/create
 * which also allow "member".
 */
export async function updateProjectLink(
  projectId: number | string,
  linkId: number | string,
  data: CreateResourceLinkInput,
): Promise<ResourceLink> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/links/${linkId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: ResourceLinkApiResponse = await res.json();
  return body.data.link;
}

/**
 * DELETE /projects/:projectId/links/:linkId — leader-only, same as
 * update. Server responds 204 No Content on success.
 */
export async function deleteProjectLink(
  projectId: number | string,
  linkId: number | string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/links/${linkId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
