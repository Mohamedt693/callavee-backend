import slugify from "slugify";
import Product from '../models/product.model.js';
import Category from '../../categories/models/Category.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Brand from '../../brands/models/brand.model.js';
import SkinProtocol from '../../protocols/models/protocol.model.js';
import SkinType from '../../Skin-types/models/skinType.model.js';
import PRODUCT_MESSAGES from "../../../utils/messages/product.messages.js";

export const addProduct = async (req, res) => {
  try {
    const { title, brand, review, features, ingredients, skinType, budgetCategory, images, categories, protocols, safetyAndCompatibility, howToUse, freeFrom, rating, reviewsCount, isFeatured } = req.body;
    
    if (!title || !brand || !review || !features || !categories || !ingredients || !skinType || !budgetCategory || !rating || !reviewsCount) {
      return res.error(PRODUCT_MESSAGES.ERROR.REQUIRED_FIELDS, 400);
    }

    const dbBrand = await Brand.findOne({ slug: brand });
    if (!dbBrand) return res.error("Brand not found", 400);

    const dbCategories = await Category.find({ slug: { $in: categories } }).distinct('_id');
    const dbIngredients = await Ingredient.find({ slug: { $in: ingredients } });
    const ingredientIds = dbIngredients.map(i => i._id);
    const dbProtocols = protocols ? await SkinProtocol.find({ slug: { $in: protocols } }).distinct('_id') : [];
    
    const dbSkinTypes = skinType ? await SkinType.find({ slug: { $in: skinType } }).distinct('_id') : [];

    const slug = slugify(title, { lower: true, strict: true, trim: true });
    
    const compatibility = {
      isPregnancySafe: dbIngredients.every(ing => ing.isPregnancySafe),
      isFungalAcneSafe: dbIngredients.every(ing => !ing.isFungalAcneTrigger),
      isComedogenic: dbIngredients.some(ing => ing.isComedogenic)
    };

    const newProduct = new Product({
      title, slug, 
      brand: dbBrand._id, 
      review, features, 
      ingredients: ingredientIds, 
      protocols: dbProtocols,
      skinType: dbSkinTypes, 
      budgetCategory,
      images: images || [],
      categories: dbCategories,
      safetyAndCompatibility: safetyAndCompatibility || [],
      compatibility, 
      howToUse: howToUse || [],
      freeFrom: freeFrom || { alcohol: false, fragrance: false, paraben: false, sulfate: false, silicone: false, oil: false },
      rating: rating || 0,
      reviewsCount: reviewsCount || 0,
      isFeatured: isFeatured || false,
    });

    const savedProduct = await newProduct.save();
    const populatedProduct = await Product.findById(savedProduct._id).populate("brand categories ingredients protocols skinType"); // <-- إضافة skinType للـ populate
    return res.success(PRODUCT_MESSAGES.SUCCESS.CREATED, populatedProduct, 201);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (updateData.title) {
      updateData.slug = slugify(updateData.title, { lower: true, strict: true, trim: true });
    }

    if (updateData.brand) {
      const dbBrand = await Brand.findOne({ slug: updateData.brand });
      if (dbBrand) updateData.brand = dbBrand._id;
    }

    if (updateData.categories) {
      updateData.categories = await Category.find({ slug: { $in: updateData.categories } }).distinct('_id');
    }

    if (updateData.protocols) {
      updateData.protocols = await SkinProtocol.find({ slug: { $in: updateData.protocols } }).distinct('_id');
    }

    if (updateData.skinType) {
      updateData.skinType = await SkinType.find({ slug: { $in: updateData.skinType } }).distinct('_id');
    }

    if (updateData.ingredients) {
      const dbIngredients = await Ingredient.find({ slug: { $in: updateData.ingredients } });
      updateData.ingredients = dbIngredients.map(i => i._id);
      
      updateData.compatibility = {
        isPregnancySafe: dbIngredients.every(ing => ing.isPregnancySafe),
        isFungalAcneSafe: dbIngredients.every(ing => !ing.isFungalAcneTrigger),
        isComedogenic: dbIngredients.some(ing => ing.isComedogenic)
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate("brand categories ingredients offers protocols skinType"); // <-- إضافة skinType للـ populate
    if (!updatedProduct) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(PRODUCT_MESSAGES.SUCCESS.UPDATED, updatedProduct, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(PRODUCT_MESSAGES.SUCCESS.DELETED, null, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};