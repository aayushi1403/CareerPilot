import express from 'express';
import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmapProgress,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRoadmap } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect); // All roadmap routes are protected

router.route('/')
  .post(validateRoadmap, createRoadmap)
  .get(getRoadmaps);

router.get('/:id', getRoadmapById);
router.patch('/:id/progress', updateRoadmapProgress);

export default router;

