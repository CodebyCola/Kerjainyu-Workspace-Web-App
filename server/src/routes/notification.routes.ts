import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const notificationController = new NotificationController();

router.use(requireAuth);

router.get("/", notificationController.list);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:notificationId/read", notificationController.markAsRead);

export default router;
