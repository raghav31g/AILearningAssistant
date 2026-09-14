import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    questions: [{
        question: { 
            type: String, 
            required: true 
        },
        options: {
            type: [String],
            required: true,
            validate: [array => array.length === 4, 'Must have exactly 4 options']
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        explanation: {
            type: String,
            default: ''
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    userAnswers: [{
        questionIndex: {
            type: Number,
            required: true
        },
        selectedAnswer: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
        answeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    isProctored: {
        type: Boolean,
        default: true
    },
    tabSwitches: {
        type: Number,
        default: 0
    },
    tabSwitchLogs: [{
        timestamp: { type: Date, default: Date.now },
        message: { type: String, default: 'Tab switch detected' }
    }],
    completedAt: {
        type: Date,
        default: null
    },
    // ── Quiz type & assignment fields ──────────────────────────────────────
    quizType: {
        type: String,
        enum: ['practice', 'assigned'],
        default: 'practice'
    },
    // Teacher who created this quiz (set on assigned quizzes)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // On a student copy: points back to the teacher's template quiz
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });
quizSchema.index({ templateId: 1 }); // fast lookup of all student copies for a template

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;