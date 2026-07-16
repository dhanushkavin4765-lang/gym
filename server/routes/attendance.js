import express from 'express';
import {
  markAttendanceByPIN,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceAnalytics
} from '../controllers/attendanceController.js';
import { protect, protectMemberOrAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Publicly accessible PIN check-in for dedicated check-in kiosk terminal
router.post('/check-in', markAttendanceByPIN);

// Admin authenticated endpoints
router.get('/today', protect, getTodayAttendance);
router.get('/member/:memberId', protectMemberOrAdmin, getMemberAttendance);
router.get('/analytics', protect, getAttendanceAnalytics);

export default router;
