import express from 'express';
import protect from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getStudents, getStudentProgress } from '../controllers/teacherController.js';
import {
    assignQuiz,
    getAssignedQuizzes,
    getAssignedQuizResults,
    downloadQuizResultsCSV
} from '../controllers/assignedQuizController.js';

const router = express.Router();

// Protected for Teachers and Administrators
router.use(protect);
router.use(authorize('teacher', 'administrator'));

router.get('/students', getStudents);
router.get('/students/:id/progress', getStudentProgress);

// Assigned quiz routes
router.post('/quizzes/assign', assignQuiz);
router.get('/quizzes', getAssignedQuizzes);
router.get('/quizzes/:templateId/results/download', downloadQuizResultsCSV);  // must be before :templateId/results
router.get('/quizzes/:templateId/results', getAssignedQuizResults);

export default router;
