import mongoose from 'mongoose';
import { 
    checkProductSafety, 
    checkIngredientSafety, 
    findDupes, 
    compareTwoProducts 
} from '../services/IngredientEngine.js';
import Product from "../../products/models/product.model.js"
import Offer from '../../Offers/models/offer.model.js';
import ToolUsage from '../models/toolUsage.model.js'; 
import { TOOL_MESSAGES } from '../../../utils/messages/tool.messages.js';

async function findProductHelper(identifier) {
    if (!identifier) return null;
    
    let product;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        product = await Product.findById(identifier)
            .populate('ingredients')
            .populate('brand')
            .populate('categories')
            .populate('protocols');
    } else {
        product = await Product.findOne({ 
            title: { $regex: identifier, $options: 'i' } 
        })
            .populate('ingredients')
            .populate('brand')
            .populate('categories')
            .populate('protocols');
    }

    if (!product) return null;

    const offers = await Offer.find({ product: product._id }).populate('store');

    const productObject = product.toObject();
    productObject.offers = offers;

    return productObject;
}

// 1. Smart Quick Check
export const smartQuickCheck = async (req, res) => {
    try {
        const { query } = req.query;
        
        const product = await Product.findOne({ title: { $regex: query, $options: 'i' } })
            .populate('ingredients');
        
        let result;
        if (product) {
            const analysis = await checkProductSafety(product.ingredients);
            result = { success: true, message: TOOL_MESSAGES.SUCCESS.QUICK_CHECK_RETRIEVED, type: 'PRODUCT', data: { title: product.title, ...analysis } };
        } else {
            const ingredient = await checkIngredientSafety(query);
            result = { success: true, message: TOOL_MESSAGES.SUCCESS.QUICK_CHECK_RETRIEVED, type: 'INGREDIENT', data: ingredient };
        }

        await ToolUsage.create({ toolName: 'smartQuickCheck', query, targetId: product?._id });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.message === 'Ingredient not found' ? 404 : 500)
            .json({ success: false, message: error.message === 'Ingredient not found' ? TOOL_MESSAGES.ERRORS.INGREDIENT_NOT_FOUND : error.message });
    }
};

// 2. Get Product Dupes
export const getProductDupes = async (req, res) => {
    try {
        const { productName } = req.params;
        
        const product = await Product.findOne({ 
            title: { $regex: productName, $options: 'i' } 
        });

        if (!product) {
            return res.status(404).json({ success: false, message: TOOL_MESSAGES.ERRORS.PRODUCT_NOT_FOUND });
        }

        const dupes = await findDupes(product);
        
        await ToolUsage.create({ toolName: 'findDupes', targetId: product._id });

        return res.status(200).json({ success: true, message: TOOL_MESSAGES.SUCCESS.DUPES_RETRIEVED, data: dupes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Compare Products
export const compareProducts = async (req, res) => {
    try {
        const { id1, id2 } = req.query;
        
        const product1 = await findProductHelper(id1);
        const product2 = await findProductHelper(id2);

        if (!product1 || !product2) {
            return res.status(404).json({ 
                success: false, 
                message: `${TOOL_MESSAGES.ERRORS.PRODUCT_NOT_FOUND}: ${!product1 ? id1 : ''} ${!product2 ? id2 : ''}`.trim() 
            });
        }

        const comparison = await compareTwoProducts(product1._id, product2._id);
        
        comparison.product1 = product1;
        comparison.product2 = product2;
        
        await ToolUsage.create({ 
            toolName: 'compare', 
            metadata: { 
                id1: product1._id, 
                id2: product2._id, 
                similarity: comparison.comparisonSummary?.similarityScore 
            } 
        });

        return res.status(200).json({ success: true, message: TOOL_MESSAGES.SUCCESS.COMPARISON_RETRIEVED, data: comparison });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Analytics Endpoint
export const getToolsAnalytics = async (req, res) => {
    try {
        const [stats, topSearches] = await Promise.all([
            ToolUsage.aggregate([
                { $group: { _id: "$toolName", usageCount: { $sum: 1 } } },
                { $sort: { usageCount: -1 } }
            ]),
            ToolUsage.aggregate([
                { $match: { toolName: 'smartQuickCheck' } },
                { $group: { _id: "$query", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        return res.status(200).json({ 
            success: true, 
            message: TOOL_MESSAGES.SUCCESS.ANALYTICS_RETRIEVED,
            data: { stats, topSearches } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};