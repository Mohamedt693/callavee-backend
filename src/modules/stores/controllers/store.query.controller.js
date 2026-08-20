import Store from '../models/store.model.js';
import Offer from '../../Offers/models/offer.model.js';
import { STORE_MESSAGES } from '../../../utils/messages/store.messages.js';

export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.aggregate([
            {
                $lookup: {
                    from: "offers",
                    localField: "_id",
                    foreignField: "store",
                    as: "offers"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "offers.product",
                    foreignField: "_id",
                    as: "products"
                }
            },
            {
                $project: {
                    name: 1,
                    baseUrl: 1,
                    logo: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalOffers: { $size: "$offers" },
                    totalBrands: {
                        $size: {
                            $reduce: {
                                input: "$products.brand",
                                initialValue: [],
                                in: {
                                    $cond: [
                                        { $in: ["$$this", "$$value"] },
                                        "$$value",
                                        { $concatArrays: ["$$value", ["$$this"]] }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]);
        
        res.status(200).json({ success: true, message: STORE_MESSAGES.SUCCESS.RETRIEVED, data: stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStoreOffers = async (req, res) => {
    try {
        const { storeId, search, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let store;
        if (storeId) {
            store = await Store.findById(storeId);
        } else {
            store = await Store.findOne({}).sort({ createdAt: 1 });
        }
        
        if (!store) return res.status(404).json({ success: false, message: STORE_MESSAGES.ERRORS.NOT_FOUND });

        const pipeline = [
            { $match: { store: store._id } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            ...(search ? [{ 
                $match: { "productDetails.title": { $regex: search, $options: 'i' } } 
            }] : []),
            { $skip: skip },
            { $limit: limitNum }
        ];

        const offers = await Offer.aggregate(pipeline);

        const countPipeline = [
            { $match: { store: store._id } },
            { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            ...(search ? [{ $match: { "productDetails.title": { $regex: search, $options: 'i' } } }] : []),
            { $count: "total" }
        ];
        
        const countResult = await Offer.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        res.status(200).json({ 
            success: true, 
            message: STORE_MESSAGES.SUCCESS.RETRIEVED_OFFERS,
            storeName: store.name,
            data: offers,
            pagination: { 
                total, 
                page: pageNum, 
                limit: limitNum, 
                pages: Math.ceil(total / limitNum) 
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};