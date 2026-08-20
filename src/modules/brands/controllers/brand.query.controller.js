import Brand from '../models/brand.model.js';
import Product from '../../products/models/product.model.js';
import { BRAND_MESSAGES } from '../../../utils/messages/brand.messages.js';

export const getBrands = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const { search, isFeatured } = req.query;
        let matchQuery = {};
        if (search) matchQuery.name = { $regex: search, $options: 'i' };
        if (isFeatured !== undefined) matchQuery.isFeatured = isFeatured === 'true';

        const total = await Brand.countDocuments(matchQuery);
        const brands = await Brand.aggregate([
            { $match: matchQuery },
            { $lookup: { from: 'products', localField: '_id', foreignField: 'brand', as: 'matchedProducts' } },
            { $project: { name: 1, slug: 1, description: 1, logo: 1, website: 1, country: 1, isFeatured: 1, createdAt: 1, productsCount: { $size: '$matchedProducts' } } },
            { $sort: { isFeatured: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.status(200).json({ success: true, data: { brands, pagination: { totalBrands: total, totalPages: Math.ceil(total / limit), currentPage: page, limit } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ success: false, message: BRAND_MESSAGES.ERRORS.NOT_FOUND });
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBrandBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const brand = await Brand.findOne({ slug });
        if (!brand) return res.status(404).json({ success: false, message: BRAND_MESSAGES.ERRORS.NOT_FOUND });

        const products = await Product.find({ brand: brand._id })
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

        res.status(200).json({ success: true, data: { brand, products } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFeaturedBrands = async (req, res) => {
    try {
        const featuredBrands = await Brand.find({ isFeatured: true })
            .select('name slug logo').sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, data: featuredBrands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};