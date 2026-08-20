import SkinProtocol from '../models/protocol.model.js';
import SkinType from '../../Skin-types/models/skinType.model.js';
import Product from '../../products/models/product.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import { PROTOCOL_MESSAGES } from '../../../utils/messages/protocol.messages.js';



export const getProtocols = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const { search, skinType, isFeatured } = req.query; 
        
        let matchQuery = {};
        if (search) matchQuery.title = { $regex: search, $options: 'i' };
        
        if (skinType) {
            const skinTypeSlugs = skinType.split(',');
            const skinTypeDocs = await SkinType.find({ slug: { $in: skinTypeSlugs } }).distinct('_id');
            matchQuery.targetSkinType = { $in: skinTypeDocs };
        }

        if (isFeatured !== undefined) {
            matchQuery.isFeatured = isFeatured === 'true';
        }

        const total = await SkinProtocol.countDocuments(matchQuery);
        const protocols = await SkinProtocol.aggregate([
            { $match: matchQuery },
            { $lookup: {
                from: 'skintypes', 
                localField: 'targetSkinType', 
                foreignField: '_id', 
                as: 'targetSkinType' 
            }},
            { $lookup: { from: 'products', localField: '_id', foreignField: 'protocols', as: 'matchedProducts' } },
            { $lookup: { from: 'ingredients', localField: '_id', foreignField: 'protocols', as: 'matchedIngredients' } },
            { $project: { 
                title: 1, 
                slug: 1, 
                description: 1, 
                logo: 1, 
                highlights: 1,
                routine: 1, 
                targetSkinType: { _id: 1, name: 1, slug: 1 },
                targetConcerns: 1,
                duration: 1,
                isFeatured: 1,      
                createdAt: 1, 
                productsCount: { $size: '$matchedProducts' }, 
                ingredientsCount: { $size: '$matchedIngredients' } 
            } },
            { $sort: { isFeatured: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.status(200).json({ 
            success: true, 
            data: { 
                protocols, 
                pagination: { totalProtocols: total, totalPages: Math.ceil(total / limit), currentPage: page, limit } 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const getProtocolById = async (req, res) => {
    try {
        const protocol = await SkinProtocol.findById(req.params.id).populate('targetSkinType', 'name slug');
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });
        res.status(200).json({ success: true, data: protocol });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const getProtocolBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const protocol = await SkinProtocol.findOne({ slug }).populate('targetSkinType', 'name slug');
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });

        const products = await Product.find({ protocols: protocol._id })
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

        const ingredients = await Ingredient.find({ protocols: protocol._id })
            .select('name slug description isFeatured')
            .sort({ isFeatured: -1 });

        res.status(200).json({ success: true, data: { protocol, products, ingredients } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const getFeaturedProtocols = async (req, res) => {
    try {
        const featured = await SkinProtocol.find({ isFeatured: true })
            .select('title slug description logo targetSkinType isFeatured')
            .populate('targetSkinType', 'name slug')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: featured });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};