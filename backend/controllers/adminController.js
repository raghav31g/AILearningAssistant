import User from '../models/User.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import SystemSettings from '../models/SystemSettings.js';

// @desc    Get all users with document/quiz counts
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role && ['student', 'teacher', 'administrator'].includes(role)) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

        // Enhance users with their document, flashcard, and quiz counts
        const enhancedUsers = await Promise.all(
            users.map(async (user) => {
                const [docCount, flashcardCount, quizCount] = await Promise.all([
                    Document.countDocuments({ userId: user._id }),
                    Flashcard.countDocuments({ userId: user._id }),
                    Quiz.countDocuments({ userId: user._id })
                ]);

                return {
                    ...user.toObject(),
                    stats: {
                        documents: docCount,
                        flashcards: flashcardCount,
                        quizzes: quizCount
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            count: enhancedUsers.length,
            data: enhancedUsers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['student', 'teacher', 'administrator'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be student, teacher, or administrator',
                statusCode: 400
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        // Prevent self-demotion if the admin is the only administrator
        if (req.user._id.toString() === id && role !== 'administrator') {
            const adminCount = await User.countDocuments({ role: 'administrator', isActive: true });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot demote the only active administrator.',
                    statusCode: 400
                });
            }
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin only)
export const toggleUserActive = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deactivating themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot deactivate your own admin account.',
                statusCode: 400
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new user by Admin
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const createAdminUser = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        if (!['student', 'teacher', 'administrator'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be student, teacher, or administrator',
                statusCode: 400
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
                statusCode: 400
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role,
            isActive: true,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getSystemStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            studentCount,
            teacherCount,
            adminCount,
            totalDocs,
            totalFlashcards,
            totalQuizzes,
            recentUsers,
            protectedSetting
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            User.countDocuments({ role: 'administrator' }),
            Document.countDocuments(),
            Flashcard.countDocuments(),
            Quiz.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
            SystemSettings.findOne({ key: 'protectedMode' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students: studentCount,
                    teachers: teacherCount,
                    administrators: adminCount
                },
                content: {
                    documents: totalDocs,
                    flashcards: totalFlashcards,
                    quizzes: totalQuizzes
                },
                protectedMode: protectedSetting ? protectedSetting.value : false,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Protected Mode status
// @route   GET /api/admin/protected-mode
// @access  Private (All authenticated users can read status)
export const getProtectedModeStatus = async (req, res, next) => {
    try {
        const setting = await SystemSettings.findOne({ key: 'protectedMode' });
        res.status(200).json({
            success: true,
            isProtectedMode: setting ? setting.value === true : false
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle Protected Mode
// @route   PUT /api/admin/protected-mode
// @access  Private (Admin only)
export const toggleProtectedMode = async (req, res, next) => {
    try {
        const { enabled } = req.body;

        let setting = await SystemSettings.findOne({ key: 'protectedMode' });
        if (!setting) {
            setting = new SystemSettings({
                key: 'protectedMode',
                value: enabled !== undefined ? Boolean(enabled) : true,
                updatedBy: req.user._id
            });
        } else {
            setting.value = enabled !== undefined ? Boolean(enabled) : !setting.value;
            setting.updatedBy = req.user._id;
        }

        await setting.save();

        res.status(200).json({
            success: true,
            message: `Protected Mode has been ${setting.value ? 'enabled' : 'disabled'}`,
            isProtectedMode: setting.value
        });
    } catch (error) {
        next(error);
    }
};
