import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import Product from '../../products/models/product.model.js';


export const checkProductSafety = async (ingredientIds) => {
    const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } });

    return {
        isPregnancySafe: !ingredients.some(i => i.isPregnancySafe === false),
        isFungalAcneSafe: !ingredients.some(i => i.isFungalAcneTrigger === true),
        comedogenicList: ingredients.filter(i => i.isComedogenic === true),
        allIngredients: ingredients 
    };
};

export const checkIngredientSafety = async (query) => {
    const ingredient = await Ingredient.findOne({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { _id: query }
        ]
    });

    if (!ingredient) {
        throw new Error('Ingredient not found');
    }

    return {
        name: ingredient.name,
        isPregnancySafe: ingredient.isPregnancySafe,
        isFungalAcneTrigger: ingredient.isFungalAcneTrigger,
        isComedogenic: ingredient.isComedogenic,
        description: ingredient.description || "No description available"
    };
};

export const findDupes = async (currentProduct) => {
    return await Product.find({
        $or: [
            { ingredients: { $in: currentProduct.ingredients } },
            { categories: { $in: currentProduct.categories } },
            { protocols: { $in: currentProduct.protocols } }
        ],
        _id: { $ne: currentProduct._id } 
    })
    .populate('offers')
    .limit(5); 
};



export const compareTwoProducts = async (id1, id2) => {
const [product1, product2] = await Promise.all([
        Product.findById(id1).populate('brand categories ingredients offers'),
        Product.findById(id2).populate('brand categories ingredients offers')
    ]);

    if (!product1 || !product2) {
        throw new Error('One or both products were not found');
    }

    const formatProductData = (p) => ({
        id: p._id,
        title: p.title,
        brand: p.brand ? p.brand.name : 'Unknown Brand',
        categories: p.categories.map(c => c.name),
        skinType: p.skinType,
        budgetCategory: p.budgetCategory,
        rating: p.rating,
        howToUse: p.howToUse,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        offers: p.offers,
        review: p.review,
        compatibility: p.compatibility,
        freeFrom: p.freeFrom,
        ingredients: p.ingredients
    });

    const p1Data = formatProductData(product1);
    const p2Data = formatProductData(product2);

    const p2IngredientIds = new Set(product2.ingredients.map(i => i._id.toString()));
    const p1IngredientIds = new Set(product1.ingredients.map(i => i._id.toString()));

    const common = product1.ingredients.filter(i => p2IngredientIds.has(i._id.toString()));
    const uniqueTo1 = product1.ingredients.filter(i => !p2IngredientIds.has(i._id.toString()));
    const uniqueTo2 = product2.ingredients.filter(i => !p1IngredientIds.has(i._id.toString()));

    const similarityScore = (common.length / Math.max(product1.ingredients.length, product2.ingredients.length)) * 100;

    return {
        product1: p1Data,
        product2: p2Data,
        comparisonSummary: {
            similarityScore: Math.round(similarityScore),
            commonIngredients: common,
            uniqueTo1,
            uniqueTo2,
            categoryMismatch: JSON.stringify(p1Data.categories) !== JSON.stringify(p2Data.categories)
        }
    };
};