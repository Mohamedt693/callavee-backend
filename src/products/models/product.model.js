import mongoose from 'mongoose';


export const VALID_SKIN_TYPES = [
    'all',
    'oily', 
    'dry', 
    'combination', 
    'sensitive', 
    'normal'
];

export const BUDGET_CATEGORY = ['economy', 'mid-range', 'premium'] ;


const freeFromSchema = new mongoose.Schema({
    alcohol: { type: Boolean, default: false },
    fragrance: { type: Boolean, default: false },
    paraben: { type: Boolean, default: false }
}, { _id: false });

const reviewContentSchema = new mongoose.Schema({
    summary: { type: String, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    editorVerdict: { type: String }
}, { _id: false });


const storeSchema = new mongoose.Schema({
    storeName: { 
        type: String, 
        enum: ['amazon', 'sephora', 'ulta', 'target'], 
        required: true 
    },
    identifier: { type: String, required: true },
    identifierType: { 
        type: String, 
        enum: ['asin', 'sku', 'upc', 'ean'], 
        default: 'asin' 
    },
    
    link: { type: String, required: true },
    
    price: {
        current: { type: Number, required: true },
        last: { type: Number },
        currency: { type: String, required: true } // 'USD', 'GBP', 'CAD'
    },
    
    isAvailable: { type: Boolean, default: true },
    
    delivery: {
        info: [String],
        isFreeShipping: { type: Boolean },
        isPrimeOrMembership: { type: Boolean }
    },
    
    boughtPastMonth: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    review: { type: reviewContentSchema, required: true },
    features: [String],
    ingredients: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ingredient'
    }],
    skinType: { type: [String], enum: VALID_SKIN_TYPES, required: true },
    budgetCategory: { type: String, enum: BUDGET_CATEGORY },
    images: [String],
    categories: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Category',
            required: true
        }
    ],
    
    stores: [storeSchema], 

    freeFrom: { 
        type: freeFromSchema, 
        default: () => ({ alcohol: false, fragrance: false, paraben: false }) 
    },

    embedding: { type: [Number], index: false },
    rating: { type: Number, default: 0, index: true },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }
}, { timestamps: true });



storeSchema.virtual('discount').get(function() {
    if (this.price && this.price.last && this.price.current && this.price.last > this.price.current) {
        return Math.round(((this.price.last - this.price.current) / this.price.last) * 100);
    }
    return 0;
});


storeSchema.set('toJSON', { virtuals: true });
storeSchema.set('toObject', { virtuals: true });

productSchema.index({ ingredients: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ skinType: 1 });
productSchema.index({ budgetCategory: 1 });
productSchema.index({ title: 'text', brandName: 'text' });

export default mongoose.model('Product', productSchema);
