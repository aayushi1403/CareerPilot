import express from 'express';
import {
  handleResumeAnalysisAi,
  handleCareerRecommendationsAi,
  handleSkillGapAnalysisAi,
  handleRoadmapGenerationAi,
  handleInterviewQuestionsAi,
  handleInterviewEvaluationAi,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/resume/analyze', handleResumeAnalysisAi);
router.post('/career/recommend', handleCareerRecommendationsAi);
router.post('/skills/gap-analysis', handleSkillGapAnalysisAi);
router.post('/roadmap/generate', handleRoadmapGenerationAi);
router.post('/interview/questions', handleInterviewQuestionsAi);
router.post('/interview/evaluate', handleInterviewEvaluationAi);

export default router;
