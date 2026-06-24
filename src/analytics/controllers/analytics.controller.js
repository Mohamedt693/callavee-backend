import Analytics from '../models/analytics.model.js';

// New record
export const recordInteraction = async (req, res) => {
    try {
        const { type, targetId, metadata, userCountry } = req.body;
        if (!type || !targetId) {
            return res.error("Missing required fields", 400);
        }

        const newInteraction = new Analytics({
            type,
            targetId,
            userCountry: req.userCountry || 'US',
            metadata: metadata || {}
        });

        await newInteraction.save();
        return res.success("Interaction recorded", {}, 201);
    } catch (error) {
        console.error("Tracking Error:", error);
        return res.error("Failed to track", 500, error);
    }
};

// last 30 days analytics
export const getGeneralStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const stats = await Analytics.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        return res.success("Stats retrieved", stats, 200);
    } catch (error) {
        return res.error("Failed to fetch stats", 500, error);
    }
};

// most popular product
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Analytics.aggregate([
            { $match: { type: { $in: ['click_buy', 'view'] } } },
            { 
                $group: { 
                    _id: { $toObjectId: "$targetId" },
                    views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
                    clicks: { $sum: { $cond: [{ $eq: ["$type", "click_buy"] }, 1, 0] } }
                } 
            },
            { $lookup: {
                from: "products", 
                localField: "_id",
                foreignField: "_id",
                as: "productInfo"
            }},
            { $unwind: "$productInfo" }, 
            { $project: { 
                _id: 1, 
                views: 1, 
                clicks: 1, 
                title: "$productInfo.title", 
                image: { $arrayElemAt: ["$productInfo.images", 0] } 
            }},
            { $sort: { clicks: -1, views: -1 } }, 
            { $limit: 6 }
        ]);
        return res.success("Top products retrieved", topProducts, 200);
    } catch (error) {
        return res.error("Failed", 500, error);
    }
};


// last 7 days analytics
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
        return res.success("Trends retrieved", dailyStats, 200);
    } catch (error) {
        return res.error("Failed to fetch trends", 500, error);
    }
};

// most popular search words
export const getSearchTrends = async (req, res) => {
    try {
        const trends = await Analytics.aggregate([
            { $match: { type: 'search' } },
            { $group: { 
                _id: "$metadata.query", 
                count: { $sum: 1 } 
            }},
            { $match: { _id: { $ne: null } } }, 
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        return res.success("Search trends retrieved", trends, 200);
    } catch (error) {
        return res.error("Failed to fetch search trends", 500, error);
    }
};


// 6.(Views)
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
            { $limit: 10 }
        ]);
        return res.success("Top viewed items retrieved", topViews, 200);
    } catch (error) {
        return res.error("Failed", 500, error);
    }
};

// 7.(Country Analytics)
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
        return res.success("Country stats retrieved", countryStats, 200);
    } catch (error) {
        return res.error("Failed to fetch country stats", 500, error);
    }
};