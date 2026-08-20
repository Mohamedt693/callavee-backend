import slugify from "slugify";
import Ingredient from "../models/Ingredients.model.js";
import Product from "../../products/models/product.model.js";
import INGREDIENT_MESSAGES from "../../../utils/messages/ingredients.messages.js";
import { updateAllRelatedProductsCompatibility, getProtocolIdsBySlugs } from "../services/ingredient.service.js";
import cache from "../../../utils/functions/cache.js"; 


const invalidateFilterCache = () => {
  cache.del("filter_options");
};

export const createIngredient = async (req, res) => {
  try {
    const { 
      name, 
      protocols: protocolSlugs, 
      incompatibleWith: incompatibleSlugs, 
      description, 
      highlights,
      suitableFor, 
      avoidFor,   
      ...rest 
    } = req.body;
    
    const protocolIds = await getProtocolIdsBySlugs(protocolSlugs);
    
    let incompatibleIds = [];
    if (incompatibleSlugs && incompatibleSlugs.length > 0) {
      const dbIncompatible = await Ingredient.find({ slug: { $in: incompatibleSlugs } });
      incompatibleIds = dbIncompatible.map(i => i._id);
    }

    const slug = slugify(name, { lower: true, strict: true, trim: true });
    
    const newIngredient = await Ingredient.create({ 
      ...rest,
      name,
      slug, 
      description,
      highlights,
      suitableFor, 
      avoidFor,    
      protocols: protocolIds,
      incompatibleWith: incompatibleIds 
    });
    
    invalidateFilterCache();
    return res.success(INGREDIENT_MESSAGES.SUCCESS.CREATED, newIngredient, 201);
  } catch (error) {
    if (error.code === 11000) return res.error(INGREDIENT_MESSAGES.ERROR.DUPLICATE, 409);
    return res.error(INGREDIENT_MESSAGES.ERROR.REQUIRED_FIELDS, 400, error);
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const { 
      name, 
      protocols: protocolSlugs, 
      incompatibleWith: incompatibleSlugs, 
      description, 
      highlights,
      suitableFor, 
      avoidFor,   
      ...rest 
    } = req.body;
    
    let updateData = { 
      ...rest,
      description,
      highlights,
      suitableFor, 
      avoidFor    
    };

    if (protocolSlugs) updateData.protocols = await getProtocolIdsBySlugs(protocolSlugs);
    if (name) updateData.slug = slugify(name, { lower: true, strict: true, trim: true });
    
    if (incompatibleSlugs) {
      const dbIncompatible = await Ingredient.find({ slug: { $in: incompatibleSlugs } });
      updateData.incompatibleWith = dbIncompatible.map(i => i._id);
    }

    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { returnDocument: "after", runValidators: true }
    );
    
    if (!updatedIngredient) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);

    return res.success(INGREDIENT_MESSAGES.SUCCESS.UPDATED, updatedIngredient, 200);
  } catch (error) {
    return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const ingredientId = req.params.id;
    const deleted = await Ingredient.findByIdAndDelete(ingredientId);
    if (!deleted) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);

    await Product.updateMany({ ingredients: ingredientId }, { $pull: { ingredients: ingredientId } });
    await updateAllRelatedProductsCompatibility(ingredientId);
    
    invalidateFilterCache();
    
    return res.success(INGREDIENT_MESSAGES.SUCCESS.DELETED, null, 200);
  } catch (error) {
    return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};