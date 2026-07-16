import express from 'express';
import {
  createPayment,
  getPayments,
  getMemberPayments,
  getReceiptDetails,
  getCollectionMetrics
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPayment)
  .get(protect, getPayments);

router.get('/member/:memberId', protect, getMemberPayments);
router.get('/receipt/:receiptNumber', protect, getReceiptDetails);
router.get('/metrics', protect, getCollectionMetrics);

export default router;
