import slugify from 'slugify';
import Ingredient from '../models/Ingredients.model.js';
import Product from '../../products/models/product.model.js';
import INGREDIENT_MESSAGES from '../../utils/messages/ingredients.messages.js';



export const createIngredient = async (req, res) => {
    try {
        const { name } = req.body;
        const slug = slugify(name, { lower: true, strict: true, trim: true });
        const newIngredient = await Ingredient.create({ ...req.body, slug });
        return res.success(INGREDIENT_MESSAGES.SUCCESS.CREATED, newIngredient, 201);
    } catch (error) {
        if (error.code === 11000) return res.error(INGREDIENT_MESSAGES.ERROR.DUPLICATE, 409);
        return res.error(INGREDIENT_MESSAGES.ERROR.REQUIRED_FIELDS, 400, error);
    }
};

export const getAllIngredients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search } = req.query; 


        let query = {};
        if (search) {
            query = { name: { $regex: search, $options: 'i' } };
        }

        const totalIngredients = await Ingredient.countDocuments(query);

        const ingredients = await Ingredient.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        return res.success(INGREDIENT_MESSAGES.SUCCESS.FETCHED_ALL, {
            ingredients,
            pagination: {
                totalIngredients,
                totalPages: Math.ceil(totalIngredients / limit),
                currentPage: page,
                limit,
            },
        }, 200);
    } catch (error) {
        return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getIngredientBySlug = async (req, res) => {
    try {
        const ingredient = await Ingredient.findOne({ slug: req.params.slug });
        if (!ingredient) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);

        const products = await Product.find({ ingredients: ingredient._id })
            .populate("categories")
            .sort({ rating: -1 });

        return res.success(INGREDIENT_MESSAGES.SUCCESS.FETCHED_ONE, { 
            ingredient, 
            products 
        }, 200);
    } catch (error) {
        return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);
        
        return res.success(INGREDIENT_MESSAGES.SUCCESS.FETCHED_ONE, ingredient, 200);
    } catch (error) {
        return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const { name } = req.body;
        let updateData = { ...req.body };

        if (name) {
            updateData.slug = slugify(name, { lower: true, strict: true, trim: true });
        }

        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after', runValidators: true } 
        );
        
        if (!updatedIngredient) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);
        
        return res.success(INGREDIENT_MESSAGES.SUCCESS.UPDATED, updatedIngredient, 200);
    } catch (error) {
        return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const deleteIngredient = async (req, res) => {
    try {
        const deleted = await Ingredient.findByIdAndDelete(req.params.id);
        if (!deleted) return res.error(INGREDIENT_MESSAGES.ERROR.NOT_FOUND, 404);
        
        return res.success(INGREDIENT_MESSAGES.SUCCESS.DELETED, null, 200);
    } catch (error) {
        return res.error(INGREDIENT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};