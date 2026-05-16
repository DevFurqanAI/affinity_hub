import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getMyNotifications);

router.patch("/read-all", markAllNotificationsAsRead);

router.patch("/:notificationId/read", markNotificationAsRead);

router.delete("/:notificationId", deleteNotification);

export default router;