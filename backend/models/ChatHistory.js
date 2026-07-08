import moongose from 'mongoose';

const chatHistorySchema = new moongose.Schema({
    userId: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
}, {
    timestamps: true
});

chatHistorySchema.index({ userId: 1, documentId: 1 });

const ChatHistory = moongose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;