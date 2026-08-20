import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    logo: { type: String }, 
    website: { type: String },
    country: { type: String },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });


brandSchema.index({ name: 'text', slug: 1 });

export default mongoose.model('Brand', brandSchema);