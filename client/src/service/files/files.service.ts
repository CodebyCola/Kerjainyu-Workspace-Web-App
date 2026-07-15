import type { AttachmentType } from "@/components/files/AttachmentRow";
import type { TaskStatus } from "@/components/taskboard/TaskCard";
import { parseApiError } from "@/utils/Errors";

export interface ProjectAttachment {
  id: number;
  submission_id: number;
  type: AttachmentType;
  content: string;
  created_at: string;
  task_id: number;
  task_title: string;
  task_status: TaskStatus;
  submitted_by: number;
  submitted_by_username: string;
}

interface AttachmentListApiResponse {
  success: true;
  data: { attachments: ProjectAttachment[] };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProjectAttachments(
  projectId: number | string,
): Promise<ProjectAttachment[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/attachments`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: AttachmentListApiResponse = await res.json();
  return body.data.attachments;
}
