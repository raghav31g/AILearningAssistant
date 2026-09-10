import express from 'express';
import protect from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    getAllUsers,
    updateUserRole,
    toggleUserActive,
    createAdminUser,
    getSystemStats,
    getProtectedModeStatus,
    toggleProtectedMode
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Status check accessible to all authenticated users
router.get('/protected-mode', getProtectedModeStatus);

// All subsequent routes restricted to administrator only
router.use(authorize('administrator'));

router.get('/users', getAllUsers);
router.post('/users', createAdminUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/stats', getSystemStats);
router.put('/protected-mode', toggleProtectedMode);

export default router;
