import express from 'express';
import {
  registerMember,
  getMembers,
  getMemberById,
  updateMember,
  searchMembers,
  deleteMember,
} from '../controllers/memberController.js';
import { protect, protectMemberOrAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMembers)
  .post(protect, registerMember);

router.get('/search', protect, searchMembers);

router.route('/:id')
  .get(protectMemberOrAdmin, getMemberById)
  .put(protect, updateMember)
  .delete(protect, deleteMember);

export default router;
