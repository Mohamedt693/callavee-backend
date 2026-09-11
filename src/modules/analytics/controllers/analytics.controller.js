import Analytics from '../models/analytics.model.js';
import Product from '../../products/models/product.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Brand from '../../brands/models/brand.model.js';
import TargetType from '../../target-types/models/targetType.model.js';
import Protocol from '../../protocols/models/protocol.model.js'; 
import { ANALYTICS_MESSAGES } from '../../../utils/messages/analytics.messages.js';

// New record
export const recordInteraction = async (req, res) => {
    try {
        const { type, targetId, metadata, userCountry } = req.body;
        if (!type || !targetId) {
            return res.error(ANALYTICS_MESSAGES.ERRORS.MISSING_FIELDS, 400);
        }

        const newInteraction = new Analytics({
            type,
            targetId,
            userCountry: req.userCountry || 'US',
            metadata: metadata || {}
        });

        await newInteraction.save();
        return res.success(ANALYTICS_MESSAGES.SUCCESS.RECORDED, {}, 201);
    } catch (error) {
        console.error("Tracking Error:", error);
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_TRACK, 500, error);
    }
};

// Last 30 days analytics + System Counters (Products, Ingredients, Brands, Target Types, Protocols)
export const getGeneralStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const [stats, productsCount, ingredientsCount, brandsCount, targetTypesCount, protocolsCount] = await Promise.all([
            Analytics.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: "$type", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Product.estimatedDocumentCount().catch(() => 0),
            Ingredient.estimatedDocumentCount().catch(() => 0),
            Brand.estimatedDocumentCount().catch(() => 0),
            TargetType.estimatedDocumentCount().catch(() => 0),
            Protocol.estimatedDocumentCount().catch(() => 0)
        ]);

        const responseData = {
            analytics: stats,
            counters: [
                { _id: 'products', count: productsCount },
                { _id: 'ingredients', count: ingredientsCount },
                { _id: 'brands', count: brandsCount },
                { _id: 'target_types', count: targetTypesCount },
                { _id: 'protocols', count: protocolsCount }
            ]
        };

        return res.success(ANALYTICS_MESSAGES.SUCCESS.STATS_RETRIEVED, responseData, 200);
    } catch (error) {
        console.error("Stats Error:", error);
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_FETCH_STATS, 500, error);
    }
};

// Get all products with conversion rates, search, and pagination
export const getAllProductsConversion = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        const productMatchStage = searchQuery
            ? { title: { $regex: searchQuery, $options: "i" } }
            : {};

        const pipeline = [
            {
                $lookup: {
                    from: "analytics",
                    let: { productId: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$targetId", "$$productId"] },
                                        { $in: ["$type", ["click_buy", "view"]] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "productAnalytics"
                }
            },
            ...(searchQuery ? [{ $match: productMatchStage }] : []),
            {
                $project: {
                    _id: 1,
                    title: 1,
                    image: { $arrayElemAt: ["$images", 0] },
                    views: {
                        $size: {
                            $filter: {
                                input: "$productAnalytics",
                                as: "item",
                                cond: { $eq: ["$$item.type", "view"] }
                            }
                        }
                    },
                    clicks: {
                        $size: {
                            $filter: {
                                input: "$productAnalytics",
                                as: "item",
                                cond: { $eq: ["$$item.type", "click_buy"] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    conversionRate: {
                        $cond: [
                            { $gt: ["$views", 0] },
                            { $round: [{ $multiply: [{ $divide: ["$clicks", "$views"] }, 100] }, 1] },
                            0
                        ]
                    }
                }
            },
            { $sort: { conversionRate: -1, clicks: -1, views: -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ];

        const result = await Product.aggregate(pipeline);
        
        const total = result[0]?.metadata[0]?.total || 0;
        const products = result[0]?.data || [];

        return res.success(ANALYTICS_MESSAGES.SUCCESS.PRODUCTS_CONVERSION_RETRIEVED, {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, 200);

    } catch (error) {
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_RETRIEVE_CONVERSION, 500, error);
    }
};

// Last 7 days analytics
export const getDailyTrends = async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyStats = await Analytics.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { 
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        return res.success(ANALYTICS_MESSAGES.SUCCESS.TRENDS_RETRIEVED, dailyStats, 200);
    } catch (error) {
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_FETCH_TRENDS, 500, error);
    }
};

// Top Viewed Items
export const getTopViewedItems = async (req, res) => {
    try {
        const topViews = await Analytics.aggregate([
            { $match: { type: 'view' } },
            { $group: { _id: { $toObjectId: "$targetId" }, views: { $sum: 1 } } },
            { $lookup: {
                from: "products", 
                localField: "_id",
                foreignField: "_id",
                as: "itemInfo"
            }},
            { $unwind: "$itemInfo" },
            { $project: { _id: 1, views: 1, title: "$itemInfo.title" }},
            { $sort: { views: -1 } },
            { $limit: 3 }
        ]);
        return res.success(ANALYTICS_MESSAGES.SUCCESS.TOP_VIEWS_RETRIEVED, topViews, 200);
    } catch (error) {
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_FETCH_TOP_VIEWS, 500, error);
    }
};

// Country Analytics
export const getCountryStats = async (req, res) => {
    try {
        const countryStats = await Analytics.aggregate([
            { 
                $group: { 
                    _id: "$userCountry", 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { count: -1 } },
            { $limit: 10 } 
        ]);
        return res.success(ANALYTICS_MESSAGES.SUCCESS.COUNTRY_STATS_RETRIEVED, countryStats, 200);
    } catch (error) {
        return res.error(ANALYTICS_MESSAGES.ERRORS.FAILED_TO_FETCH_COUNTRY_STATS, 500, error);
    }
};