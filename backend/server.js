import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoute.js';
import documentRoutes from './routes/documentRoute.js';
import flashcardRoute from './routes/flashcardRoute.js';
import aiRoute from './routes/aiRoute.js';
import quizRoute from './routes/quizRoute.js';
import progressRoute from './routes/progressRoute.js';
import adminRoute from './routes/adminRoute.js';
import teacherRoute from './routes/teacherRoute.js';

// ES6 module ___dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//initialize express app
const app = express();

// connect to MongoDB
connectDB();

// Middleware to handle CORS (Cross-Origin Resource Sharing) requests
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins in dev, requests with no origin, or matched client URLs
            if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
    }));

app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Learning Assistant API is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve static files from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoute);
app.use('/api/ai', aiRoute);
app.use('/api/quizzes', quizRoute);
app.use('/api/progress', progressRoute);
app.use('/api/admin', adminRoute);
app.use('/api/teacher', teacherRoute);

app.use(errorHandler); // Error handling middleware

// 404 error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        statusCode: 404
    });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});