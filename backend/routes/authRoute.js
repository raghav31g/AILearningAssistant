import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';

import protect from '../middleware/auth.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg,
            errors: errors.array(),
            statusCode: 400
        });
    }
    next();
};

// validation middleware
const registerValidation = [
    body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
    body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
    body('password')
    .notEmpty()
    .withMessage('Password is required'),
    handleValidationErrors
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;