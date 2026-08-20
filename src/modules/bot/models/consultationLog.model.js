import mongoose from "mongoose";

const consultationLogSchema = new mongoose.Schema(
    {
        userMessage: { type: String, required: true },
        aiResponse: { type: String, required: true },
        skinType: { type: String, default: "Not specified" },
        mainConcern: { type: String, default: "Not specified" },
        recommendedProducts: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("ConsultationLog", consultationLogSchema);