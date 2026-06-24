import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    verificationToken: { type: String },
    
    subscriptions: [{
        type: { 
            type: String, 
            enum: ['product', 'newsletter'], 
            required: true 
        },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
        category: { type: String }, 
        addedAt: { type: Date, default: Date.now }
    }]
});

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);