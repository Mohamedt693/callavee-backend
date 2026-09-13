import Product from '../models/product.model.js';
import Category from '../../categories/models/Category.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Brand from '../../brands/models/brand.model.js';
import Protocol from '../../protocols/models/protocol.model.js';
import TargetType from '../../target-types/models/targetType.model.js'; 
import PRODUCT_MESSAGES from "../../../utils/messages/product.messages.js";

export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const { 
            categories, targetTypes, brand, ingredients, protocols, 
            budgetCategory, search, freeFrom, compatibility, isFeatured 
        } = req.query;

        const [foundBrand, foundIngredients, foundProtocols, foundTargetTypes] = await Promise.all([
            brand ? Brand.findOne({ slug: brand }) : Promise.resolve(null),
            ingredients ? Ingredient.find({ slug: { $in: ingredients.split(',') } }).select('_id') : Promise.resolve(null),
            protocols ? Protocol.find({ slug: { $in: protocols.split(',') } }).select('_id') : Promise.resolve(null),
            targetTypes ? TargetType.find({ slug: { $in: targetTypes.split(',') } }).select('_id') : Promise.resolve(null)
        ]);

        let allCategoryIds = null;
        if (categories) {
            const targetCats = await Category.find({ slug: { $in: categories.split(',') } });
            const targetIds = targetCats.map(c => c._id);

            allCategoryIds = await Category.find({ 
                $or: [
                    { _id: { $in: targetIds } }, 
                    { path: { $regex: targetIds.map(id => `,${id.toString()},`).join('|') } }
                ]
            }).distinct('_id');
        }

        let matchQuery = {};
        if (search) matchQuery.title = { $regex: search, $options: "i" };
        if (allCategoryIds) matchQuery.categories = { $in: allCategoryIds };
    
        if (brand) {
            if (foundBrand) {
                matchQuery.brand = foundBrand._id;
            } else {
                return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, { products: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: 1, limit } }, 200);
            }
        }

        if (ingredients) {
            const ingredientIds = foundIngredients.map(ing => ing._id);
            matchQuery.ingredients = ingredientIds.length === ingredients.split(',').length 
                ? { $all: ingredientIds } 
                : { $in: [] };
        }

        if (protocols) {
            const protocolIds = foundProtocols.map(p => p._id);
            matchQuery.protocols = protocolIds.length > 0 ? { $in: protocolIds } : { $in: [] };
        }

        if (targetTypes) {
            const targetTypeIds = foundTargetTypes ? foundTargetTypes.map(tt => tt._id) : [];
            matchQuery.targetTypes = targetTypeIds.length > 0 ? { $in: targetTypeIds } : { $in: [] };
        }

        if (compatibility) {
            compatibility.split(',').forEach(slug => {
                if (slug === 'isComedogenic') {
                    matchQuery[`compatibility.${slug}`] = false;
                } else {
                    matchQuery[`compatibility.${slug}`] = true;
                }
            });
        }

        if (freeFrom) {
            freeFrom.split(',').forEach(slug => {
                matchQuery[`freeFrom.${slug}`] = true;
            });
        }

        if (budgetCategory) matchQuery.budgetCategory = { $in: budgetCategory.split(',') };
        if (isFeatured !== undefined) matchQuery.isFeatured = isFeatured === 'true';

        const pipeline = [{ $match: matchQuery }];
        const countResult = await Product.aggregate([...pipeline, { $count: 'total' }]);
        const totalProducts = countResult.length > 0 ? countResult[0].total : 0;
    
        pipeline.push(
            { $sort: { isFeatured: -1, createdAt: -1 } },
            { $lookup: { from: 'categories', localField: 'categories', foreignField: '_id', as: 'categories' } },
            { $lookup: { from: 'ingredients', localField: 'ingredients', foreignField: '_id', as: 'ingredients' } },
            { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'targettypes', localField: 'targetTypes', foreignField: '_id', as: 'targetTypes' } },
            { $lookup: { from: 'protocols', localField: 'protocols', foreignField: '_id', as: 'protocols' } },
            { $lookup: { from: 'offers', localField: '_id', foreignField: 'product', as: 'offers' } },
            { $unwind: { path: '$offers', preserveNullAndEmptyArrays: true } },
            { 
                $lookup: { 
                    from: 'stores', 
                    localField: 'offers.store', 
                    foreignField: '_id', 
                    as: 'offers.store' 
                } 
            },
            { 
                $unwind: { 
                    path: '$offers.store', 
                    preserveNullAndEmptyArrays: true 
                } 
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    offers: { 
                        $push: { 
                            $cond: { 
                                if: { $ifNull: ['$offers._id', false] }, 
                                then: '$offers', 
                                else: '$$REMOVE' 
                            } 
                        } 
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$doc', { offers: '$offers' }]
                    }
                }
            },
            { $sort: { isFeatured: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        );

        const products = await Product.aggregate(pipeline);
        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, {
            products,
            pagination: { totalProducts, totalPages: Math.ceil(totalProducts / limit), currentPage: page, limit },
        });
    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const product = await Product.findOne({ slug })
        .populate("brand categories targetTypes protocols") 
        .populate({
            path: "ingredients",
            options: { sort: { isFeatured: -1 } } 
        })
        .populate({
            path: "offers",
            populate: {
                path: "store",
                model: "Store",
                select: 'name slug logo baseUrl'
            }
        });

        if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            $or: [
                { categories: { $in: product.categories } },
                { protocols: { $in: product.protocols } },
                { ingredients: { $in: product.ingredients } }
            ]
        })
        .populate("brand categories targetTypes protocols") 
        .populate({
            path: "ingredients",
            options: { sort: { isFeatured: -1 } }
        })
        .populate({
            path: "offers",
            populate: {
                path: "store",
                model: "Store",
                select: 'name slug logo baseUrl'
            }
        })
        .limit(12)
        .sort({ rating: -1 });

        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ONE, {
            product,
            relatedProducts
        }, 200);

    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("brand categories ingredients protocols targetTypes")
            .populate({
                path: "offers",
                populate: {
                    path: "store",
                    model: "Store"
                }
            });
            
        if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);
        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ONE, product, 200);
    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getProductsByIds = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.error(PRODUCT_MESSAGES.ERROR.INVALID_ID, 400);
        const idArray = ids.split(",");
        const products = await Product.find({ _id: { $in: idArray } }).populate("brand categories ingredients offers protocols targetTypes");
        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, products, 200);
    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getTopSellers = async (req, res) => {
    try {
        const topSellers = await Product.find().populate("brand categories ingredients offers protocols targetTypes").limit(8);
        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, { topSellers }, 200);
    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true })
            .populate("brand categories ingredients protocols targetTypes") 
            .populate({
                path: "offers",
                populate: {
                    path: "store",
                    model: "Store"
                }
            })
            .sort({ rating: -1 })
            .limit(20);
            
        return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, { featuredProducts }, 200);
    } catch (error) {
        return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};