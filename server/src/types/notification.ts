// types/notification.ts — no matching Zod schema; system-generated only
import { NotificationType } from "../database/types";

export type CreateNotificationData = {
  user_id: number;
  type: NotificationType;
  reference_type?: string | null;
  reference_id?: number | null;
  message: string;
};

export type UpdateNotificationData = Partial<{
  is_read: boolean;
}>;