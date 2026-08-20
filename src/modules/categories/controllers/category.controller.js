import slugify from "slugify";
import Category from "../models/Category.model.js";
import Product from "../../products/models/product.model.js";
import cache from "../../../utils/functions/cache.js"; 
import { CATEGORY_MESSAGES } from '../../../utils/messages/category.messages.js';

const invalidateFilterCache = () => {
  cache.del("filter_options");
};

const generatePath = async (parent) => {
  if (!parent) return ",";
  const parentCat = await Category.findById(parent);
  return parentCat ? `${parentCat.path}${parent},` : ",";
};

export const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    let level = 0, path = ",";

    if (parent) {
      const parentCat = await Category.findById(parent);
      if (parentCat) {
        level = parentCat.level + 1;
        path = `${parentCat.path}${parent},`;
      }
    }
    const category = await Category.create({ name, slug, parent: parent || null, level, path });
    
    invalidateFilterCache();
    
    res.status(201).json({ success: true, message: CATEGORY_MESSAGES.SUCCESS.CREATED, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const catId = req.params.id;
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (parent !== undefined) {
      updateData.parent = parent || null;
      updateData.path = await generatePath(parent);
      const parentCat = await Category.findById(parent);
      updateData.level = parentCat ? parentCat.level + 1 : 0;
    }

    const category = await Category.findByIdAndUpdate(catId, updateData, { new: true });
    if (parent !== undefined) {
      const children = await Category.find({ parent: catId });
      for (const child of children) {
        await Category.findByIdAndUpdate(child._id, { 
            path: `${category.path}${catId},`,
            level: category.level + 1 
        });
      }
    }
    
    invalidateFilterCache();
    
    res.status(200).json({ success: true, message: CATEGORY_MESSAGES.SUCCESS.UPDATED, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const hasChildren = await Category.findOne({ parent: catId });
    if (hasChildren) {
      return res.status(400).json({ success: false, message: CATEGORY_MESSAGES.ERRORS.HAS_CHILDREN });
    }
    const isUsedInProducts = await Product.findOne({ categories: catId });
    if (isUsedInProducts) {
      return res.status(400).json({ success: false, message: CATEGORY_MESSAGES.ERRORS.IS_USED_IN_PRODUCTS });
    }
    await Category.findByIdAndDelete(catId);
    
    invalidateFilterCache();
    
    res.status(200).json({ success: true, message: CATEGORY_MESSAGES.SUCCESS.DELETED });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};