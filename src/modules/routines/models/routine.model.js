import mongoose from "mongoose";

const routineSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        timeOfDay: { type: String, enum: ['am', 'pm', 'both'], default: 'both' },
        frequency: { type: [String], default: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }
    }]
}, { timestamps: true });

export default mongoose.model('Routine', routineSchema);