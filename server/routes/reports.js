import express from 'express';
import {
  getDashboardData,
  getReportData,
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/export/:type', protect, getReportData);

export default router;
