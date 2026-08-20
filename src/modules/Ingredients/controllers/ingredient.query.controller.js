import Ingredient from "../models/Ingredients.model.js";
import Product from "../../products/models/product.model.js";
import INGREDIENT_MESSAGES from "../../../utils/messages/ingredients.messages.js";


export const getAllIngredients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const { search, isFeatured } = req.query;

    let matchQuery = {};
    if (search) {
      matchQuery.name = { $regex: search, $options: 'i' };
    }
    if (isFeatured !== undefined) {
      matchQuery.isFeatured = isFeatured === 'true';
    }

    const totalIngredients = await Ingredient.countDocuments(matchQuery);

    const ingredients = await Ingredient.aggregate([
      { $match: matchQuery },
      { 
        $lookup: { 
          from: 'products', 
          localField: '_id', 
          foreignField: 'ingredients', 
          as: 'matchedProducts' 
        } 
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: 'incompatibleWith',
          foreignField: '_id',
          as: 'incompatibleWith'
        }
      },
      { 
        $project: { 
          name: 1, 
          slug: 1, 
          description: 1, 
          highlights: 1,
          isFeatured: 1, 
          safetyRating: 1,
          usageLevel: 1,          
          source: 1,            
          irritationPotential: 1,
          createdAt: 1, 
          incompatibleWith: { name: 1, slug: 1 },
          productsCount: { $size: '$matchedProducts' } 
        } 
      },
      { $sort: { isFeatured: -1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    return res.status(200).json({ 
      success: true, 
      data: { 
        ingredients, 
        pagination: { 
          totalIngredients, 
          totalPages: Math.ceil(totalIngredients / limit), 
          currentPage: page, 
          limit 
        } 
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getIngredientBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const ingredient = await Ingredient.findOne({ slug })
      .populate("protocols")
      .populate("incompatibleWith", "name slug");
      
    if (!ingredient) return res.status(404).json({ success: false, message: 'Ingredient not found' });

    const products = await Product.find({ ingredients: ingredient._id })
      .sort({ rating: -1 })
      .limit(10)
      .select('title slug rating images review.summary')
      .populate({
        path: 'offers',
        populate: {
          path: 'store',
          model: 'Store',
          select: 'name slug logo baseUrl'
        }
      });

    res.status(200).json({ success: true, data: { ingredient, products } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate("protocols")
      .populate("incompatibleWith", "name slug");
      
    if (!ingredient) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(INGREDIENT_MESSAGES.SUCCESS.FETCHED_ONE, ingredient, 200);
  } catch (error) {
    return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

