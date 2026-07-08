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

// ES6 module ___dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//initialize express app
const app = express();

// connect to MongoDB
connectDB();

//Middleware to handle CORS (Cross-Origin Resource Sharing) requests
app.use(
    cors({
        origin: '*', // Allow requests from any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
        credentials: true, // Allow cookies to be sent with requests
    }));

app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Serve static files from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoute)
app.use('/api/ai', aiRoute)
app.use('/api/quizzes', quizRoute)
app.use('/api/progress', progressRoute)

app.use(errorHandler); // Error handling middleware

// 404 error handler

app.get((req, res) => {
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