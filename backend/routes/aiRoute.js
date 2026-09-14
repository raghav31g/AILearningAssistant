import express from 'express';
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory
} from '../controllers/aiController.js';

import protect from '../middleware/auth.js';
import { checkProtectedMode } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

// Generation routes are guarded by Protected Mode (blocks students when enabled by admin)
router.post('/generate-flashcards', checkProtectedMode, generateFlashcards);
router.post('/generate-quiz', checkProtectedMode, generateQuiz);
router.post('/generate-summary', checkProtectedMode, generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', checkProtectedMode, explainConcept);
router.get('/chat-history/:documentId', getChatHistory);

export default router;