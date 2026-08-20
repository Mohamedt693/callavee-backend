import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true,
        index: true 
    },
    store: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Store', 
        required: true 
    },
    identifier: { type: String, required: true },
    identifierType: { 
        type: String, 
        enum: ['asin', 'sku', 'upc', 'ean'], 
        default: 'asin' 
    },

    size: { type: String },          
    packageQuantity: { type: Number, default: 1 },
    
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
}, { timestamps: true });


offerSchema.index({ product: 1, store: 1, size: 1, packageQuantity: 1 });

export default mongoose.model('Offer', offerSchema);