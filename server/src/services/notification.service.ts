import { NotificationRepository } from "../repositories/notification.repository";
import { NotFoundError } from "../shared/errors";
import { NotificationType } from "../database/types";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async notify(
    user_id: number,
    type: NotificationType,
    message: string,
    reference?: { reference_type: string; reference_id: number },
  ) {
    try {
      return await notificationRepository.create({
        user_id,
        type,
        message,
        reference_type: reference?.reference_type ?? null,
        reference_id: reference?.reference_id ?? null,
      });
    } catch (err) {
      console.error("Failed to create notification:", err);
      return null;
    }
  }

  async getMyNotifications(
    user_id: number,
    unreadOnly = false,
    limit = 50,
    offset = 0,
  ) {
    return await notificationRepository.getByUser(
      user_id,
      unreadOnly,
      limit,
      offset,
    );
  }

  async getUnreadCount(user_id: number) {
    return await notificationRepository.getUnreadCount(user_id);
  }

  async markAsRead(id: number, user_id: number) {
    const updated = await notificationRepository.markAsRead(id, user_id);
    if (!updated) throw new NotFoundError("Notification");
    return updated;
  }

  async markAllAsRead(user_id: number) {
    return await notificationRepository.markAllAsRead(user_id);
  }
}
