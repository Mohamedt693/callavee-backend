import Ingredient from "../models/Ingredients.model.js";

export const getIngredientFilters = async (req, res) => {
    try {
        const { search } = req.query;
        
        const query = search 
            ? { name: { $regex: search, $options: 'i' } } 
            : {};

        const filters = await Ingredient.find(query, 'name slug')
            .limit(10)
            .sort({ name: 1 });

        res.status(200).json({ success: true, data: filters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getFeaturedIngredients = async (req, res) => {
    try {
        const featuredIngredients = await Ingredient.find({ isFeatured: true })
            .select('name slug')
            .sort({ createdAt: -1 })
            .limit(20);
            
        res.status(200).json({ success: true, data: featuredIngredients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};