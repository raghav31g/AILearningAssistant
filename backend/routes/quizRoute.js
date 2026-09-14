import express from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  getAssignedQuizzesForStudent
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// IMPORTANT: specific routes must come before dynamic /:documentId
// to prevent Express from matching 'quiz', 'assigned', or 'results' as a documentId param
router.get('/assigned', getAssignedQuizzesForStudent);          // GET /api/quizzes/assigned
router.get('/quiz/:id', getQuizById);                           // GET /api/quizzes/quiz/:id
router.get('/:id/results', getQuizResults);                     // GET /api/quizzes/:id/results
router.post('/:id/submit', submitQuiz);                         // POST /api/quizzes/:id/submit
router.delete('/:id', deleteQuiz);                              // DELETE /api/quizzes/:id
router.get('/:documentId', getQuizzes);                         // GET /api/quizzes/:documentId  ← must be last

export default router;