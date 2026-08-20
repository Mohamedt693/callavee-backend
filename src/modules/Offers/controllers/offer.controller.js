import Offer from "../models/offer.model.js";
import OFFER_MESSAGES from "../../../utils/messages/offer.messages.js";

// Add a new offer to an existing product
export const addOffer = async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    return res.success(OFFER_MESSAGES.SUCCESS.CREATED, newOffer, 201);
  } catch (error) {
    return res.error(OFFER_MESSAGES.ERROR.CREATION_FAILED, 500, error);
  }
};
// Update an existing offer by ID
export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updatedOffer = await Offer.findByIdAndUpdate(offerId, req.body, {
      returnDocument: 'after',
    });
    if (!updatedOffer) return res.error(OFFER_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(OFFER_MESSAGES.SUCCESS.UPDATED, updatedOffer, 200);
  } catch (error) {
    return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Update or create an offer by params (Optimized for Scrapers)
export const updateOfferByParams = async (req, res) => {
  try {
    const { productId, store, identifier, size, packageQuantity } = req.body;
    
    const filter = { 
      product: productId, 
      store, 
      identifier,
      size: size || null,                  
      packageQuantity: packageQuantity || 1  
    };

    const updatedOffer = await Offer.findOneAndUpdate(
      filter,
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return res.success(OFFER_MESSAGES.SUCCESS.UPSERTED, updatedOffer, 200);
  } catch (error) {
    return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Delete an offer from the system
export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const deleted = await Offer.findByIdAndDelete(offerId);
    if (!deleted) return res.error(OFFER_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(OFFER_MESSAGES.SUCCESS.DELETED, null, 200);
  } catch (error) {
    return res.error(OFFER_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

