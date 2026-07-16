import express from 'express';
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from '../controllers/trainerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTrainers)
  .post(protect, createTrainer);

router.route('/:id')
  .put(protect, updateTrainer)
  .delete(protect, deleteTrainer);

export default router;
