import mongoose from 'mongoose';

const guidelineSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['do', 'dont'],
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Guideline = mongoose.model('Guideline', guidelineSchema);

export default Guideline;
