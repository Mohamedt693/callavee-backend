import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }, 
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: [{ type: String }], 
    function: [String], 
    safetyRating: { type: String, enum: ['high', 'medium', 'low', 'unknown'] },
    isStarIngredient: { type: Boolean, default: false },
    researchLinks: [{
        title: String,
        url: String
    }],
}, { timestamps: true });


ingredientSchema.index({ name: 'text', slug: 1 });
export default mongoose.model('Ingredient', ingredientSchema);