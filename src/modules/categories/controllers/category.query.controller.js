import Category from "../models/Category.model.js";
import Product from "../../products/models/product.model.js";
import { buildTree, calculateTotal } from "../services/category.service.js";
import { CATEGORY_MESSAGES } from '../../../utils/messages/category.messages.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const categoryCounts = await Product.aggregate([
      { 
        $project: { 
          lastCategory: { $arrayElemAt: ["$categories", -1] } 
        } 
      },
      { $group: { _id: "$lastCategory", count: { $sum: 1 } } },
    ]); 

    const categoriesWithCounts = categories.map((cat) => {
      const countEntry = categoryCounts.find((c) => String(c._id) === String(cat._id));
      return { ...cat, directCount: countEntry ? countEntry.count : 0 };
    });

    return res.status(200).json({ 
        success: true, 
        message: CATEGORY_MESSAGES.SUCCESS.RETRIEVED,
        data: buildTree(categoriesWithCounts, null, calculateTotal) 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};