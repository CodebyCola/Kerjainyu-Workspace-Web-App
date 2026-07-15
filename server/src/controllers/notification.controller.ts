import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unread === "true";
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;
      const notifications = await notificationService.getMyNotifications(
        req.user!.userId,
        unreadOnly,
        limit,
        offset,
      );
      res.status(200).json({ success: true, data: { notifications } });
    } catch (err) {
      next(err);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      res.status(200).json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = Number(req.params.notificationId);
      const notification = await notificationService.markAsRead(notificationId, req.user!.userId);
      res.status(200).json({ success: true, data: { notification } });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
