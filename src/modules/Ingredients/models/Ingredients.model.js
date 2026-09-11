import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }, 
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    highlights: [{ type: String }],
    protocols: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Protocol' 
    }],
    safetyRating: { type: String, enum: ['high', 'medium', 'low', 'unknown'] },
    isFeatured: { type: Boolean, default: false },
    researchLinks: [{
        title: String,
        url: String
    }],
    isFungalAcneTrigger: { type: Boolean, default: false },
    isPregnancySafe: { type: Boolean, default: true }, 
    isComedogenic: { type: Boolean, default: false }, 
    usageLevel: { type: String, enum: ['active', 'exfoliant', 'moisturizer', 'preservative', 'surfactant'] },
    irritationPotential: { type: Number, min: 0, max: 5, default: 0 },
    incompatibleWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    source: { type: String, enum: ['synthetic', 'natural', 'plant-derived', 'animal-derived'] },
    pHRange: {
        min: { type: Number },
        max: { type: Number }
    },
    suitableFor: [{ 
        type: String, 
        trim: true,
        //['Dry Skin', 'Oily Skin', 'Hyperpigmentation', 'Anti-Aging']
    }],
    avoidFor: [{ 
        type: String, 
        trim: true,
        //['Sensitive Skin', 'Rosacea', 'Eczema']
    }]
}, { timestamps: true });

ingredientSchema.index({ protocols: 1 });
ingredientSchema.index({ name: 'text', slug: 1 });
ingredientSchema.index({ isFungalAcneTrigger: 1 });
ingredientSchema.index({ isPregnancySafe: 1 });
ingredientSchema.index({ isComedogenic: 1 });


export default mongoose.model('Ingredient', ingredientSchema);