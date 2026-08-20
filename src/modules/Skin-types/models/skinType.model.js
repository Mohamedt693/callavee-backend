import mongoose from 'mongoose';

const skinTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    characteristics: [{ type: String }], 
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

skinTypeSchema.index({ name: 'text', slug: 1 });

export default mongoose.model('SkinType', skinTypeSchema);