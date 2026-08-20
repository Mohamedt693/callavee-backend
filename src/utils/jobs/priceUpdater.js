import Offer from '../../modules/Offers/models/offer.model.js';
import { PriceHistory } from '../../modules/price-history/models/priceHistory.model.js';
import Subscriber  from '../../modules/subsciptions/models/subscription.model.js';
import { fetchProductPrice } from '../../services/scraper.js';
import { sendPriceDropNotification } from "../../services/email.service.js";

// Job to update prices and notify subscribers
export const runPriceUpdate = async () => {
  console.log("--- Starting Offer price update job ---");
  try {
    // Fetch all offers that have a tracking link
    const offers = await Offer.find({ 
        link: { $ne: null }, 
        storeName: 'amazon' 
    }).populate('product');

    for (const offer of offers) {
      try {
        const newData = await fetchProductPrice(offer.storeName, offer.identifier);

        if (newData && typeof newData.price === "number") {
          const newPrice = newData.price;

          // Check if the price has changed
          if (newPrice !== offer.price.current) {
            
            // 1. ALWAYS record in history if price changed (Higher or Lower)
            // This is crucial for building Price History charts later
            await PriceHistory.create({
              product: offer.product._id,
              storeName: offer.storeName,
              price: newPrice,
            });

            // 2. Only send notification if price dropped
            if (newPrice < offer.price.current) {
              const activeSubscribers = await Subscriber.find({
                status: "active",
                interests: { $elemMatch: { productId: offer.product._id, isActive: true } },
              });

              for (const sub of activeSubscribers) {
                await sendPriceDropNotification(sub.email, offer.product, newPrice, offer.storeName);
              }
            }
          }

          // 3. Update offer document
          offer.price.last = offer.price.current;
          offer.price.current = newPrice;
          offer.isAvailable = newData.is_available ?? true;
          
          await offer.save();
        }
      } catch (err) {
        console.error(`Error updating offer ${offer._id}:`, err.message);
      }
      
      // Rate limiting: wait 2 seconds between requests to avoid blocking
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error("Critical error in price update job:", error);
  }
  console.log("--- Price update job finished ---");
};