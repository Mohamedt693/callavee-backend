import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        default: null 
    },
    level: { type: Number, default: 0 }, // 0 = Main, 1 = Sub, 2 = Sub-Sub
    path: { type: String, index: true }
});

categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

categorySchema.index({ path: 1, level: 1 });
export default mongoose.model('Category', categorySchema);