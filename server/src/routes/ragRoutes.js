import express from 'express';
import { queryAssistant, ingestDocument, getRagStatus } from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All RAG endpoints require authentication
router.use(protect);

router.post('/query', queryAssistant);
router.post('/ingest', ingestDocument);
router.get('/status', getRagStatus);

export default router;
