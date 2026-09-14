import Document from '../models/Document.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import * as geminiService from '../utils/geminiService.js';

// @desc    Teacher creates an assigned quiz — generates questions and copies to all students
// @route   POST /api/teacher/quizzes/assign
// @access  Private (Teacher, Administrator)
export const assignQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a documentId',
                statusCode: 400
            });
        }

        // Teacher must own the document
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready. Please upload a document first.',
                statusCode: 404
            });
        }

        // Generate questions with Gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // Create the teacher's template quiz (userId = teacher, quizType = 'assigned')
        const template = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} — Assigned Quiz`,
            questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
            quizType: 'assigned',
            createdBy: req.user._id
        });

        // Push one copy to every active student
        const students = await User.find({ role: 'student', isActive: true }).select('_id');

        const studentCopies = students.map(student => ({
            userId: student._id,
            documentId: document._id,
            title: template.title,
            questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
            quizType: 'assigned',
            createdBy: req.user._id,
            templateId: template._id
        }));

        if (studentCopies.length > 0) {
            await Quiz.insertMany(studentCopies);
        }

        res.status(201).json({
            success: true,
            message: `Quiz assigned to ${studentCopies.length} student(s)`,
            data: {
                templateId: template._id,
                title: template.title,
                totalQuestions: template.totalQuestions,
                studentsAssigned: studentCopies.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all assigned quizzes created by this teacher (templates only)
// @route   GET /api/teacher/quizzes
// @access  Private (Teacher, Administrator)
export const getAssignedQuizzes = async (req, res, next) => {
    try {
        const templates = await Quiz.find({
            createdBy: req.user._id,
            templateId: null,
            quizType: 'assigned'
        })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

        const enriched = await Promise.all(
            templates.map(async (t) => {
                const [total, completed] = await Promise.all([
                    Quiz.countDocuments({ templateId: t._id }),
                    Quiz.countDocuments({ templateId: t._id, completedAt: { $ne: null } })
                ]);

                const completedQuizzes = await Quiz.find({
                    templateId: t._id,
                    completedAt: { $ne: null }
                }).select('score');

                const avgScore = completedQuizzes.length > 0
                    ? Math.round(completedQuizzes.reduce((s, q) => s + q.score, 0) / completedQuizzes.length)
                    : null;

                return {
                    _id: t._id,
                    title: t.title,
                    document: t.documentId,
                    totalQuestions: t.totalQuestions,
                    createdAt: t.createdAt,
                    studentsTotal: total,
                    studentsCompleted: completed,
                    averageScore: avgScore
                };
            })
        );

        res.status(200).json({
            success: true,
            count: enriched.length,
            data: enriched
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get per-student results for one assigned quiz
// @route   GET /api/teacher/quizzes/:templateId/results
// @access  Private (Teacher, Administrator)
export const getAssignedQuizResults = async (req, res, next) => {
    try {
        const { templateId } = req.params;

        const template = await Quiz.findOne({
            _id: templateId,
            createdBy: req.user._id,
            quizType: 'assigned'
        }).populate('documentId', 'title');

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Assigned quiz not found',
                statusCode: 404
            });
        }

        const copies = await Quiz.find({ templateId })
            .populate('userId', 'username email')
            .sort({ completedAt: -1 });

        const results = copies.map(copy => ({
            studentId: copy.userId?._id,
            studentName: copy.userId?.username || 'Unknown',
            studentEmail: copy.userId?.email || '',
            score: copy.score,
            totalQuestions: copy.totalQuestions,
            completedAt: copy.completedAt,
            tabSwitches: copy.tabSwitches || 0,
            status: copy.completedAt ? 'completed' : 'pending'
        }));

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: template._id,
                    title: template.title,
                    document: template.documentId,
                    totalQuestions: template.totalQuestions,
                    createdAt: template.createdAt
                },
                results
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Download CSV of student marks for an assigned quiz
// @route   GET /api/teacher/quizzes/:templateId/results/download
// @access  Private (Teacher, Administrator)
export const downloadQuizResultsCSV = async (req, res, next) => {
    try {
        const { templateId } = req.params;

        const template = await Quiz.findOne({
            _id: templateId,
            createdBy: req.user._id,
            quizType: 'assigned'
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Assigned quiz not found',
                statusCode: 404
            });
        }

        const copies = await Quiz.find({ templateId })
            .populate('userId', 'username email')
            .sort({ 'userId.username': 1 });

        const rows = [
            ['Student Name', 'Email', 'Score (%)', 'Correct Answers', 'Total Questions', 'Tab Switches', 'Status', 'Completed At']
        ];

        copies.forEach(copy => {
            rows.push([
                copy.userId?.username || 'Unknown',
                copy.userId?.email || '',
                copy.completedAt ? copy.score : '',
                copy.completedAt ? copy.userAnswers.filter(a => a.isCorrect).length : '',
                copy.totalQuestions,
                copy.tabSwitches || 0,
                copy.completedAt ? 'Completed' : 'Pending',
                copy.completedAt ? new Date(copy.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''
            ]);
        });

        const csvContent = rows
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const safeTitle = template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `quiz_results_${safeTitle}_${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    } catch (error) {
        next(error);
    }
};
