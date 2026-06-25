import mongoose from 'mongoose';

const PriceHistorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    storeName: { type: String, required: true }, 
    price: { type: Number, required: true },
    checkedAt: { type: Date, default: Date.now }
});

PriceHistorySchema.index({ productId: 1, storeName: 1, checkedAt: -1 });


export const PriceHistory = mongoose.model('PriceHistory', PriceHistorySchema);