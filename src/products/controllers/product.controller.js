import slugify from "slugify";
import Product from '../models/product.model.js';
import Category from '../../categories/models/Category.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import PRODUCT_MESSAGES from "../../utils/messages/product.messages.js";

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const {
      title, brandName, categories, skinType, budgetCategory, ingredients,
      stores, review, features, isFeatured, images, freeFrom, rating, reviewsCount,
    } = req.body;

    // Validate required fields including the new review object
    if (!title || !brandName || !features || !categories || !skinType || !stores || 
        stores.length === 0 || !review || !review.summary) {
      return res.error(PRODUCT_MESSAGES.ERROR.REQUIRED_FIELDS, 400);
    }

    const slug = slugify(title, { lower: true, strict: true, trim: true });

    const newProduct = new Product({
      title, brandName, slug, categories, skinType, budgetCategory,
      ingredients: ingredients || [],
      stores, 
      review, 
      features, 
      isFeatured,
      images: images || [],
      freeFrom: freeFrom || { alcohol: false, fragrance: false, paraben: false },
      rating: rating || 0,
      reviewsCount: reviewsCount || 0,
    });

    const savedProduct = await newProduct.save();
    const populatedProduct = await Product.findById(savedProduct._id)
        .populate("categories")
        .populate("ingredients");

    return res.success(PRODUCT_MESSAGES.SUCCESS.CREATED, populatedProduct, 201);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug }).populate("categories").populate("ingredients");

    if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ONE, product, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categories").populate("ingredients");
    if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ONE, product, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get bulk of products by list of IDs
export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.error(PRODUCT_MESSAGES.ERROR.INVALID_ID, 400);

    const idArray = ids.split(",");
    const products = await Product.find({ _id: { $in: idArray } }).populate("categories").populate("ingredients");

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, products, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get all products with pagination, search, and filtering
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, skinType, budgetCategory, search, alcoholFree, fragranceFree, parabenFree, ingredients } = req.query;
    let filterQuery = {};

    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filterQuery.categories = { $in: [category] };
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          filterQuery.categories = { $in: [foundCategory._id] };
        } else {
          filterQuery.categories = { $in: [] };
        }
      }
    }

    if (ingredients) {
        const ingredientsArray = ingredients.split(',');
        filterQuery.ingredients = { $in: ingredientsArray };
    }

    if (skinType) filterQuery.skinType = { $in: [skinType] };
    if (budgetCategory) filterQuery.budgetCategory = budgetCategory;
    
    if (alcoholFree === 'true') filterQuery['freeFrom.alcohol'] = true;
    if (fragranceFree === 'true') filterQuery['freeFrom.fragrance'] = true;
    if (parabenFree === 'true') filterQuery['freeFrom.paraben'] = true;

    const totalProducts = await Product.countDocuments(filterQuery);

    const products = await Product.find(filterQuery)
      .populate("categories")
      .populate("ingredients")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, {
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get top seller products
export const getTopSellers = async (req, res) => {
  try {
    const topSellers = await Product.find({ "stores.isAvailable": true })
      .populate("categories")
      .populate("ingredients")
      .sort({ "stores.boughtPastMonth": -1 })
      .limit(8);

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, { topSellers }, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true })
      .populate("categories")
      .populate("ingredients")
      .sort({ rating: -1 })
      .limit(8);

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, { featuredProducts }, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Get related products based on categories, skin type, and common ingredients
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

    const related = await Product.find({
      _id: { $ne: product._id },
      categories: { $in: product.categories },
      skinType: { $in: product.skinType },
      ingredients: { $in: product.ingredients },
      "stores.isAvailable": true,
    })
      .populate("categories")
      .populate("ingredients")
      .limit(12)
      .sort({ rating: -1 });

    return res.success(PRODUCT_MESSAGES.SUCCESS.FETCHED_ALL, related, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.title) {
      updateData.slug = slugify(updateData.title, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true } 
    )
    .populate("categories")
    .populate("ingredients");

    if (!updatedProduct)
      return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

    return res.success(PRODUCT_MESSAGES.SUCCESS.UPDATED, updatedProduct, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);
    return res.success(PRODUCT_MESSAGES.SUCCESS.DELETED, null, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};

// Toggle store availability
export const toggleStoreAvailability = async (req, res) => {
  try {
    const { productId, storeId } = req.params;
    const product = await Product.findById(productId);

    if (!product) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

    const store = product.stores.id(storeId);
    if (!store) return res.error(PRODUCT_MESSAGES.ERROR.NOT_FOUND, 404);

    store.isAvailable = !store.isAvailable;
    await product.save();

    return res.success(PRODUCT_MESSAGES.SUCCESS.AVAILABILITY_TOGGLED, store, 200);
  } catch (error) {
    return res.error(PRODUCT_MESSAGES.ERROR.SERVER_ERROR, 500, error);
  }
};