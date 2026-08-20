import Product from "../../products/models/product.model.js";
import Protocol from "../../protocols/models/protocol.model.js";

export const updateAllRelatedProductsCompatibility = async (ingredientId) => {
    const products = await Product.find({ ingredients: ingredientId }).populate("ingredients");
    const updatePromises = products.map(async (product) => {
        const ingredients = product.ingredients;
        const compatibility = {
            isFungalAcneSafe: ingredients.every((ing) => !ing.isFungalAcneTrigger),
            isPregnancySafe: ingredients.every((ing) => ing.isPregnancySafe),
            isComedogenic: ingredients.some((ing) => ing.isComedogenic),
        };
        return Product.findByIdAndUpdate(product._id, { compatibility });
    });
    await Promise.all(updatePromises);
};

export const getProtocolIdsBySlugs = async (slugs) => {
    if (!slugs || slugs.length === 0) return [];
    const protocols = await Protocol.find({ slug: { $in: slugs } });
    return protocols.map((p) => p._id);
};