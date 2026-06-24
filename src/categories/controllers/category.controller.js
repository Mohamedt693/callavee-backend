import slugify from "slugify";
import Category from '../models/Category.model.js';
import Product from '../../products/models/product.model.js';

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const generatedSlug = slugify(name, { lower: true, strict: true });
        
        const category = new Category({ 
            name, 
            slug: generatedSlug 
        });
        
        await category.save();
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search } = req.query;
        let matchQuery = {};

        if (search) {
            matchQuery.name = { $regex: search, $options: 'i' };
        }

        const totalResult = await Category.aggregate([
            { $match: matchQuery },
            { $count: "total" }
        ]);
        
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        const categoriesWithCount = await Category.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'categories',
                    as: 'matchedProducts'
                }
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    createdAt: 1,
                    productsCount: { $size: '$matchedProducts' }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        return res.status(200).json({
            success: true,
            data: categoriesWithCount,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        const updateData = { name };
        if (name) {
            updateData.slug = slugify(name, { lower: true, strict: true });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};