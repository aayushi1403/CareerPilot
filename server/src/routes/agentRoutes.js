import express from 'express';
import { chatWithAgent, getAvailableTools } from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All agent endpoints require authentication
router.use(protect);

router.post('/chat', chatWithAgent);
router.get('/tools', getAvailableTools);

export default router;
