import express from 'express';
import {
  saveConversation,
  getConversations,
  getConversationById,
  deleteConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All chat routes are protected

router.route('/')
  .post(saveConversation)
  .get(getConversations);

router.route('/:id')
  .get(getConversationById)
  .delete(deleteConversation);

export default router;

