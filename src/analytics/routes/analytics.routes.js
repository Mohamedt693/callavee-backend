import express from 'express';
import { 
    recordInteraction, 
    getGeneralStats, 
    getTopProducts, 
    getDailyTrends,
    getSearchTrends,
    getTopViewedItems,
    getCountryStats
} from '../controllers/analytics.controller.js';

const router = express.Router();


router.post('/track', recordInteraction);
router.get('/stats', getGeneralStats);
router.get('/top-products', getTopProducts);
router.get('/trends', getDailyTrends);
router.get('/search-trends', getSearchTrends);
router.get('/top-views', getTopViewedItems);
router.get('/countries', getCountryStats);

export default router;