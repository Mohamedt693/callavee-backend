import mongoose from 'mongoose';

const quickTipSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    snippet: {
        type: String,
        required: [true, 'Snippet is required']
    },
    fullContent: {
        type: String,
        required: [true, 'Full content is required']
    },
    readTime: {
        type: String,
        required: [true, 'Read time is required'],
        default: '1 min read'
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true
});

const QuickTip = mongoose.model('QuickTip', quickTipSchema);

export default QuickTip;
