import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema({
    query: { type: String, required: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resultsCount: { 
        products: Number, 
        ingredients: Number 
    }
}, { timestamps: true });

export default mongoose.model('SearchQuery', searchQuerySchema);