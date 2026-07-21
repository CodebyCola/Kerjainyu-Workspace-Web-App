import { parseApiError } from "@/utils/Errors";

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  username: string;
  comment: string;
  created_at: string;
}

interface CommentListApiResponse {
  success: true;
  data: { comments: TaskComment[] };
}

interface CommentApiResponse {
  success: true;
  data: { comment: TaskComment };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function commentsUrl(projectId: number | string, taskId: number | string) {
  return `${BASE_URL}/projects/${projectId}/tasks/${taskId}/comments`;
}

export async function getComments(
  projectId: number | string,
  taskId: number | string,
): Promise<TaskComment[]> {
  const res = await fetch(commentsUrl(projectId, taskId), {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: CommentListApiResponse = await res.json();
  return body.data.comments;
}

export async function addComment(
  projectId: number | string,
  taskId: number | string,
  comment: string,
): Promise<TaskComment> {
  const res = await fetch(commentsUrl(projectId, taskId), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: CommentApiResponse = await res.json();
  return body.data.comment;
}

export async function deleteComment(
  projectId: number | string,
  taskId: number | string,
  commentId: number,
): Promise<void> {
  const res = await fetch(`${commentsUrl(projectId, taskId)}/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
