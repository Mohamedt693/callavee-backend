import Product from '../../products/models/product.model.js';
import Ingredient from '../../Ingredients/models/Ingredients.model.js';
import SearchQuery from '../models/SearchQuery.model.js';

export const globalSearch = async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q || !q.trim()) return res.status(200).json({ results: [] });

        const escapedQuery = q.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const searchRegex = new RegExp(escapedQuery, 'i');

        let results = [];
        let productCount = 0;
        let ingredientCount = 0;

        if (type === 'products' || !type) {
            const products = await Product.find({ title: { $regex: searchRegex } })
                .limit(20)
                .populate({
                    path: 'offers',
                    populate: {
                        path: 'store',
                        model: 'Store'
                    }
                }) 
                .select('title slug images rating review offers'); 

            results = [...results, ...products.map(p => ({
                _id: p._id,
                type: 'product',
                title: p.title,
                slug: p.slug,
                images: p.images,
                review: p.review,
                rating: p.rating,
                offers: p.offers 
            }))];
            productCount = products.length;
        }

        if (type === 'ingredients' || !type) {
            const ingredients = await Ingredient.find({ name: { $regex: searchRegex } })
                .limit(20)
                .select('name slug description');

            results = [...results, ...ingredients.map(i => ({
                _id: i._id,
                type: 'ingredient',
                name: i.name,
                slug: i.slug,
                description: i.description
            }))];
            ingredientCount = ingredients.length;
        }

        await SearchQuery.create({
            query: q.trim().toLowerCase(),
            resultsCount: { products: productCount, ingredients: ingredientCount }
        });

        return res.status(200).json({ results });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSearchAnalytics = async (req, res) => {
    try {
        const stats = await SearchQuery.aggregate([
            {
                $group: {
                    _id: "$query",
                    count: { $sum: 1 },
                    avgProducts: { $avg: "$resultsCount.products" },
                    avgIngredients: { $avg: "$resultsCount.ingredients" },
                    lastSearched: { $max: "$createdAt" }
                }
            },
            { $sort: { lastSearched: -1, count: -1 } },
            { $limit: 50 }
        ]);
        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
