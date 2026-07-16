import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  loginMember
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/member-login', loginMember);
router.route('/profile')
  .get(protect, getAdminProfile)
  .put(protect, updateAdminProfile);
router.put('/change-password', protect, changeAdminPassword);

export default router;
