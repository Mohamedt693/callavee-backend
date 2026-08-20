import mongoose from "mongoose";

const toolUsageSchema = new mongoose.Schema({
    toolName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    targetId: { type: mongoose.Schema.Types.ObjectId }, 
    query: String, 
    metadata: Object 
}, { timestamps: true });

export default mongoose.model('ToolUsage', toolUsageSchema);