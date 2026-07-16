import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.put('/read-all', protect, markAllNotificationsAsRead);

router.route('/:id')
  .put(protect, markNotificationAsRead)
  .delete(protect, deleteNotification);

export default router;
