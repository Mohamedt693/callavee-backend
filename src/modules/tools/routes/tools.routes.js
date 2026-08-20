import express from 'express';
import { 
    smartQuickCheck, 
    getProductDupes, 
    compareProducts, 
    getToolsAnalytics
} from '../controllers/tools.controller.js';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// The unified smart search tool (Product OR Ingredient)
router.get('/quick-check', smartQuickCheck);

// Find product alternatives
router.get('/dupes/:productName', getProductDupes);

// Compare two products side by side
router.get('/compare', compareProducts);
router.get('/analytics', protectAdmin, getToolsAnalytics);
export default router;