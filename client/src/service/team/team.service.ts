import { parseApiError } from "@/utils/Errors";

/** Mirrors the `project_role` enum (server/src/database/types.ts). */
export type ProjectRole = "leader" | "member";

export interface ProjectMember {
  id: number;
  username: string;
  role: ProjectRole;
  joined_at: string;
}

interface MemberListApiResponse {
  success: true;
  data: { members: ProjectMember[] };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** GET /projects/:projectId/members — any active member. */
export async function getProjectMembers(
  projectId: number | string,
): Promise<ProjectMember[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: MemberListApiResponse = await res.json();
  return body.data.members;
}

export interface MemberLookupResult {
  id: number;
  username: string;
  alreadyMember: boolean;
}

interface MemberLookupApiResponse {
  success: true;
  data: MemberLookupResult;
}

export async function lookupProjectMember(
  projectId: number | string,
  username: string,
): Promise<MemberLookupResult> {
  const url = new URL(`${BASE_URL}/projects/${projectId}/members/lookup`);
  url.searchParams.set("username", username);

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: MemberLookupApiResponse = await res.json();
  return body.data;
}

export interface MembershipRow {
  id: number;
  project_id: number;
  user_id: number;
  role: ProjectRole;
  status: "invited" | "active" | "removed";
  joined_at: string;
}

export async function addProjectMember(
  projectId: number | string,
  username: string,
  role: ProjectRole,
): Promise<MembershipRow> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, role }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: { success: true; data: { member: MembershipRow } } =
    await res.json();
  return body.data.member;
}

/** DELETE /projects/:projectId/members/:userId — leader only, can't remove the leader. */
export async function removeProjectMember(
  projectId: number | string,
  userId: number,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/projects/${projectId}/members/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function leaveProject(projectId: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members/leave`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function transferLeader(
  projectId: number | string,
  newLeaderId: number,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/projects/${projectId}/members/transfer-leader`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_leader_id: newLeaderId }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
