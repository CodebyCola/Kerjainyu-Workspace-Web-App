import type { AttachmentType } from "@/components/files/AttachmentRow";
import { parseApiError } from "@/utils/Errors";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "revision_requested"
  | "rejected";

export interface SubmissionAttachmentInput {
  type: AttachmentType;
  content: string;
}

export interface SubmissionAttachment {
  id: number;
  submission_id: number;
  type: AttachmentType;
  content: string;
  created_at: string;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  submitted_by: number;
  submitted_by_username: string;
  note: string | null;
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_by: number | null;
  reviewed_by_username: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  attachments?: SubmissionAttachment[];
}

export interface SubmitTaskInput {
  note?: string;
  attachments?: SubmissionAttachmentInput[];
}

export interface ReviewSubmissionInput {
  review_status: Exclude<ReviewStatus, "pending">;
  review_note?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function submissionsUrl(projectId: number | string, taskId: number | string) {
  return `${BASE_URL}/projects/${projectId}/tasks/${taskId}/submissions`;
}

export async function submitTask(
  projectId: number | string,
  taskId: number | string,
  input: SubmitTaskInput,
): Promise<TaskSubmission> {
  const res = await fetch(submissionsUrl(projectId, taskId), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note: input.note?.trim() || undefined,
      attachments: input.attachments ?? [],
    }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: { success: true; data: { submission: TaskSubmission } } =
    await res.json();
  return body.data.submission;
} 
export async function getLatestSubmission(
  projectId: number | string,
  taskId: number | string,
): Promise<TaskSubmission | null> {
  const res = await fetch(`${submissionsUrl(projectId, taskId)}/latest`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: { success: true; data: { submission: TaskSubmission | null } } =
    await res.json();
  return body.data.submission;
}

export async function getSubmissionHistory(
  projectId: number | string,
  taskId: number | string,
): Promise<TaskSubmission[]> {
  const res = await fetch(`${submissionsUrl(projectId, taskId)}/history`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: { success: true; data: { submissions: TaskSubmission[] } } =
    await res.json();
  return body.data.submissions;
}

export async function reviewSubmission(
  projectId: number | string,
  taskId: number | string,
  submissionId: number | string,
  input: ReviewSubmissionInput,
): Promise<TaskSubmission> {
  const res = await fetch(
    `${submissionsUrl(projectId, taskId)}/${submissionId}/review`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: { success: true; data: { submission: TaskSubmission } } =
    await res.json();
  return body.data.submission;
}
