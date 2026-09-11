import mongoose from 'mongoose';

const targetTypeSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true, 
        enum: [
            'skin', 'hair', 'body', 'face', 'nails', 
            'lips', 'eyes', 'fragrance', 'oral', 'beard', 'sun-care'
        ], 
        lowercase: true, 
        trim: true,
        index: true
    },
    name: { type: String, required: true, trim: true }, 
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    characteristics: [{ type: String }], 
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Compound unique index so the same slug can exist under different types
targetTypeSchema.index({ type: 1, slug: 1 }, { unique: true });

export default mongoose.model('TargetType', targetTypeSchema);