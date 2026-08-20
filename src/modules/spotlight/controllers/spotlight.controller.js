import Spotlight from '../models/Spotlight.model.js';
import Product from '../../products/models/product.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Brand from '../../brands/models/brand.model.js';

export const createSpotlight = async (req, res) => {
    try {
        const spotlight = await Spotlight.create(req.body);
        res.status(201).json({ success: true, data: spotlight });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getSpotlights = async (req, res) => {
    try {
        const spotlights = await Spotlight.find().lean();

        const formatted = await Promise.all(spotlights.map(async (item) => {
            let targetData = null;

            if (item.type === 'product') {
                targetData = await Product.findById(item.targetId).select('slug').lean();
            } else if (item.type === 'ingredient') {
                targetData = await Ingredient.findById(item.targetId).select('slug').lean();
            } else if (item.type === 'brand') {
                targetData = await Brand.findById(item.targetId).select('slug').lean();
            }

            return {
                ...item,
                targetSlug: targetData?.slug || item.targetSlug
            };
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSpotlight = async (req, res) => {
    try {
        const { id } = req.params;
        const spotlight = await Spotlight.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!spotlight) {
            return res.status(404).json({ success: false, message: 'Spotlight not found' });
        }

        res.status(200).json({ success: true, data: spotlight });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteSpotlight = async (req, res) => {
    try {
        const { id } = req.params;
        const spotlight = await Spotlight.findByIdAndDelete(id);

        if (!spotlight) {
            return res.status(404).json({ success: false, message: 'Spotlight not found' });
        }

        res.status(200).json({ success: true, message: 'Spotlight deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};