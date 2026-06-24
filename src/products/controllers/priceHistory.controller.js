import { PriceHistory } from "../models/priceHistory.model.js";
import Product from "../models/product.model.js";

export const getPriceHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.error("Product not found", 404);
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const history = await PriceHistory.find({
      productId,
      checkedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ checkedAt: 1 })
      .select("price checkedAt -_id");

    const fullHistory = [
      ...history,
      { price: product.currentPrice, checkedAt: product.updatedAt },
    ];

    return res.success("History fetched successfully", fullHistory, 200);
  } catch (error) {
    return res.error("Server error while fetching history", 500, error);
  }
};
