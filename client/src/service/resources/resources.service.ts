import type { CreateResourceLinkInput } from "@/service/resources/resources.validator";
import { parseApiError } from "@/utils/Errors";
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
