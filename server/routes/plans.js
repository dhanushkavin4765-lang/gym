import express from 'express';
import {
  getPlans,
  getActivePlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPlans)
  .post(protect, createPlan);

router.get('/active', protect, getActivePlans);

router.route('/:id')
  .put(protect, updatePlan)
  .delete(protect, deletePlan);

export default router;
