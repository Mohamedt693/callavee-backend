import express from 'express';
import { globalSearch, getSearchAnalytics } from '../controllers/search.controller.js'; 
import { protectAdmin } from '../../../middlewares/auth.middleware.js'
const router = express.Router();

router.get('/', globalSearch);
router.get('/analytics', protectAdmin, getSearchAnalytics);

export default router;