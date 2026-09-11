import mongoose from "mongoose";
import Offer from '../../Offers/models/offer.model.js';

export const BUDGET_CATEGORY = ["economy", "mid-range", "premium"];

const freeFromSchema = new mongoose.Schema(
  {
    alcohol: { type: Boolean, default: false },
    fragrance: { type: Boolean, default: false },
    paraben: { type: Boolean, default: false },
    sulfate: { type: Boolean, default: false },
    silicone: { type: Boolean, default: false },
    oil: { type: Boolean, default: false },
    soap: { type: Boolean, default: false },
  },
  { _id: false },
);

const reviewContentSchema = new mongoose.Schema(
  {
    summary: { type: String, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    editorVerdict: { type: String },
  },
  { _id: false },
);

const compatibilityFlagsSchema = new mongoose.Schema(
  {
    isPregnancySafe: { type: Boolean, default: true },
    isFungalAcneSafe: { type: Boolean, default: true },
    isComedogenic: { type: Boolean, default: false },
  },
  { _id: false },
);

const subContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    protocols: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Protocol",
      },
    ],
    review: { type: reviewContentSchema, required: true },
    features: [String],
    ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    
    targetTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TargetType",
        required: true,
      },
    ],

    budgetCategory: { type: String, enum: BUDGET_CATEGORY },
    images: [String],
    safetyAndCompatibility: [subContentSchema],
    compatibility: {
      type: compatibilityFlagsSchema,
      default: () => ({
        isPregnancySafe: true,
        isFungalAcneSafe: true,
        isComedogenic: false,
      }),
    },
    howToUse: [subContentSchema],
    freeFrom: {
      type: freeFromSchema,
      default: () => ({
        alcohol: false,
        fragrance: false,
        paraben: false,
        sulfate: false,
        silicone: false,
        oil: false,
        soap: false,
      }),
    },
    embedding: { type: [Number], index: false },
    rating: { type: Number, default: 0, index: true },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("offers", {
  ref: "Offer",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await Offer.deleteMany({ product: doc._id });
  }
  next();
});

productSchema.index({ title: 'text' });
productSchema.index({ ingredients: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ targetTypes: 1 });
productSchema.index({ budgetCategory: 1 });
productSchema.index({ "compatibility.isPregnancySafe": 1 });
productSchema.index({ "compatibility.isFungalAcneSafe": 1 });
productSchema.index({ "compatibility.isComedogenic": 1 });
productSchema.index({ title: "text", brand: "text" });

export default mongoose.model("Product", productSchema);