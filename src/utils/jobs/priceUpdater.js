import Product from '../../products/models/product.model.js';
import { PriceHistory } from '../../products/models/priceHistory.model.js';
import { Subscriber } from '../../subsciptions/models/subscription.model.js';
import { fetchProductPrice } from '../../services/scraper.js';
import { sendPriceDropNotification } from "../../services/email.service.js";

export const runPriceUpdate = async () => {
  console.log("--- Starting multi-store price update job ---");
  try {
    const products = await Product.find({});

    for (const product of products) {
      if (!product.stores || product.stores.length === 0) continue;

      for (const store of product.stores) {
        try {
          const newData = await fetchProductPrice(store.storeName, store.identifier);

          if (newData && typeof newData.price === "number") {
            const newPrice = newData.price;
            
            if (newPrice < store.price.current) {
              await PriceHistory.create({
                productId: product._id,
                storeName: store.storeName,
                price: newPrice,
              });

              const activeSubscribers = await Subscriber.find({
                status: "active",
                interests: { $elemMatch: { productId: product._id, isActive: true } },
              });

              for (const sub of activeSubscribers) {
                await sendPriceDropNotification(sub.email, product, newPrice, store.storeName);
              }
            }

            store.price.last = store.price.current;
            store.price.current = newPrice;
            store.isAvailable = newData.is_available ?? true;
            store.boughtPastMonth = newData.bought_past_month ?? store.boughtPastMonth;
          }
        } catch (err) {
          console.error(`Error updating ${store.storeName} for ${product.title}:`, err.message || err);
        }
      }
      
      await product.save();
      console.log(`Product fully updated: ${product.title}`);
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error("Critical error in price update job:", error);
  }
  console.log("--- Price update job finished ---");
};