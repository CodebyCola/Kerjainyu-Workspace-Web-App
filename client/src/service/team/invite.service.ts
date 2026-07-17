import type { ProjectRole } from "@/service/team/team.service";
import { parseApiError } from "@/utils/Errors";

export interface ProjectInvite {
  id: number;
  project_id: number;
  role: ProjectRole;
  joined_at: string;
  project_title: string;
}

interface InviteListApiResponse {
  success: true;
  data: { invites: ProjectInvite[] };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyInvites(): Promise<ProjectInvite[]> {
  const res = await fetch(`${BASE_URL}/invites`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: InviteListApiResponse = await res.json();
  return body.data.invites;
}

export async function acceptInvite(projectId: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/invites/${projectId}/accept`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function declineInvite(projectId: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/invites/${projectId}/decline`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
