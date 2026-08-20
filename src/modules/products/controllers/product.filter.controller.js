import cache from "../../../utils/functions/cache.js";
import Category from '../../categories/models/Category.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Brand from '../../brands/models/brand.model.js';
import SkinProtocol from '../../protocols/models/protocol.model.js';
import SkinType from '../../Skin-types/models/skinType.model.js';
import PRODUCT_MESSAGES from "../../../utils/messages/product.messages.js";

export const getFilterOptions = async (req, res) => {
  try {
    const [categories, ingredients, brands, protocols, skinTypes] = await Promise.all([
      Category.find({}).select('name slug parent level path'),
      Ingredient.find({}).select('name slug').limit(10).sort({ name: 1 }),
      Brand.find({}).select('name slug').limit(10).sort({ name: 1 }),
      SkinProtocol.find({}).select('title slug').limit(10).sort({ title: 1 }),
      SkinType.find({}).select('name slug').sort({ name: 1 }) 
    ]);

    const filterOptions = {
      categories,
      ingredients,
      brands,
      protocols, 
      skinTypes, 
      budgetCategories: ['economy', 'mid-range', 'premium'],
      freeFrom: [
        { name: 'Alcohol Free', slug: 'alcohol' },
        { name: 'Fragrance Free', slug: 'fragrance' },
        { name: 'Paraben Free', slug: 'paraben' },
        { name: 'Sulfate Free', slug: 'sulfate' },
        { name: 'Silicone Free', slug: 'silicone' },
        { name: 'Oil Free', slug: 'oil' },
        { name: 'Soap Free', slug: 'soap' }
      ],
      compatibility: [
        { name: 'Pregnancy Safe', slug: 'isPregnancySafe' },
        { name: 'Fungal Acne Safe', slug: 'isFungalAcneSafe' },
        { name: 'Non-Comedogenic', slug: 'isComedogenic' }
      ]
    };

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, filterOptions, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

export const searchFilterItems = async (req, res) => {
  try {
    const { type } = req.params; // 'brands' | 'ingredients' | 'protocols' | 'skinTypes'
    const { search } = req.query;

    const modelMap = {
      brands: Brand,
      ingredients: Ingredient,
      protocols: SkinProtocol,
      skinTypes: SkinType 
    };

    const Model = modelMap[type];
    if (!Model) {
      return res.error("Invalid filter type", 400);
    }

    const searchField = type === 'protocols' ? 'title' : 'name';
    const selectFields = type === 'protocols' ? 'title slug' : 'name slug';
    
    const query = search ? { [searchField]: { $regex: search, $options: 'i' } } : {};

    const items = await Model.find(query)
      .select(selectFields)
      .limit(10)
      .sort({ [searchField]: 1 });

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, items, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};