import express from 'express';
import protect from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getStudents, getStudentProgress } from '../controllers/teacherController.js';

const router = express.Router();

// Protected for Teachers and Administrators
router.use(protect);
router.use(authorize('teacher', 'administrator'));

router.get('/students', getStudents);
router.get('/students/:id/progress', getStudentProgress);

export default router;
