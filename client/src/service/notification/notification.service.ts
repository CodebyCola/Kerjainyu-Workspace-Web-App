import { parseApiError } from "@/utils/Errors";

export type NotificationType =
  | "deadline_reminder"
  | "task_assigned"
  | "task_swapped"
  | "swap_requested"
  | "submission_pending"
  | "submission_reviewed"
  | "comment_added"
  | "appeal_updated"
  | "member_added"
  | "member_invited";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  reference_type: string | null;
  reference_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationListApiResponse {
  success: true;
  data: { notifications: Notification[] };
}

interface UnreadCountApiResponse {
  success: true;
  data: { count: number };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getNotifications(
  params: { unreadOnly?: boolean; limit?: number; offset?: number } = {},
): Promise<Notification[]> {
  const url = new URL(`${BASE_URL}/notifications`);
  if (params.unreadOnly) url.searchParams.set("unread", "true");
  if (params.limit != null) url.searchParams.set("limit", String(params.limit));
  if (params.offset != null)
    url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: NotificationListApiResponse = await res.json();
  return body.data.notifications;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  const body: UnreadCountApiResponse = await res.json();
  return body.data.count;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
