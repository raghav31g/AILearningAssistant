import User from '../models/User.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get all students with performance metrics
// @route   GET /api/teacher/students
// @access  Private (Teacher, Administrator)
export const getStudents = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { role: 'student' };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await User.find(query).sort({ createdAt: -1 }).select('-password');

        // Enhance student profiles with their learning activity
        const enhancedStudents = await Promise.all(
            students.map(async (student) => {
                const [docs, flashcards, quizzes] = await Promise.all([
                    Document.countDocuments({ userId: student._id }),
                    Flashcard.countDocuments({ userId: student._id }),
                    Quiz.find({ userId: student._id }).select('title score totalQuestions completed createdAt')
                ]);

                const completedQuizzes = quizzes.filter(q => q.completed);
                const avgScore = completedQuizzes.length > 0
                    ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length)
                    : 0;

                return {
                    ...student.toObject(),
                    stats: {
                        documentsCount: docs,
                        flashcardsCount: flashcards,
                        totalQuizzes: quizzes.length,
                        completedQuizzes: completedQuizzes.length,
                        averageScore: avgScore
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            count: enhancedStudents.length,
            data: enhancedStudents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get detailed progress for a specific student
// @route   GET /api/teacher/students/:id/progress
// @access  Private (Teacher, Administrator)
export const getStudentProgress = async (req, res, next) => {
    try {
        const { id } = req.params;

        const student = await User.findById(id).select('-password');
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found',
                statusCode: 404
            });
        }

        const [documents, flashcards, quizzes] = await Promise.all([
            Document.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
            Flashcard.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
            Quiz.find({ userId: id }).sort({ createdAt: -1 })
        ]);

        const completedQuizzes = quizzes.filter(q => q.completed);
        const avgScore = completedQuizzes.length > 0
            ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                student,
                stats: {
                    totalDocuments: documents.length,
                    totalFlashcards: flashcards.length,
                    totalQuizzes: quizzes.length,
                    completedQuizzes: completedQuizzes.length,
                    averageScore: avgScore
                },
                documents,
                flashcards,
                quizzes
            }
        });
    } catch (error) {
        next(error);
    }
};
