import express from 'express';
import { 
    recordInteraction, 
    getGeneralStats, 
    getAllProductsConversion,
    getDailyTrends,
    getTopViewedItems,
    getCountryStats
} from '../controllers/analytics.controller.js';

const router = express.Router();


router.post('/track', recordInteraction);
router.get('/stats', getGeneralStats);
router.get('/conversion-rate', getAllProductsConversion);
router.get('/trends', getDailyTrends);
router.get('/top-views', getTopViewedItems);
router.get('/countries', getCountryStats);

export default router;