import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['view', 'click_buy', 'filter', 'bot'], 
        required: true 
    },
    
    targetId: { type: String, required: true },
    
    userCountry: { type: String, default: 'US' },
    
    
    metadata: { type: mongoose.Schema.Types.Mixed },
    
}, { 
    timestamps: true 
});

analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ targetId: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;