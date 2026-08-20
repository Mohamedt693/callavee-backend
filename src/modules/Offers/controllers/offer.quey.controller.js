import Offer from "../models/offer.model.js";
import OFFER_MESSAGES from "../../../utils/messages/offer.messages.js";


// Fetch all offers for a specific product
export const getOffersByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
    
        const offers = await Offer.find({ product: productId })
            .populate('store', 'name');

        return res.success(OFFER_MESSAGES.SUCCESS.FETCHED_ALL, offers, 200);
    } catch (error) {
        return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

// Fetch a single offer by ID
export const getOfferById = async (req, res) => {
    try {
        const { offerId } = req.params;
        const offer = await Offer.findById(offerId);
        if (!offer) return res.error(OFFER_MESSAGES.ERROR.NOT_FOUND, 404);
        return res.success(OFFER_MESSAGES.SUCCESS.FETCHED_ONE, offer, 200);
    } catch (error) {
        return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

// Get all offers with pagination, search, and filtering
export const getOffers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { store, isAvailable, search, product } = req.query;
        let filterQuery = {};

        if (product) filterQuery.product = product;

        if (store) filterQuery.store = store;
    
        if (isAvailable !== undefined) {
            filterQuery.isAvailable = isAvailable === "true";
        }

        if (search) {
            filterQuery.$or = [{ identifier: { $regex: search, $options: "i" } }];
        }

        // Count total documents for pagination
        const total = await Offer.countDocuments(filterQuery);

        // Fetch offers
        const offers = await Offer.find(filterQuery)
            .populate("product", "title") 
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        return res.success(OFFER_MESSAGES.SUCCESS.FETCHED_ALL,
            {
                offers,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            }, 200,
        );
    } catch (error) {
        return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};
