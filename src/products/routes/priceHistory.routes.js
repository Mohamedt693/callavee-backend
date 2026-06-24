import express from 'express';
import { getPriceHistory } from '../controllers/priceHistory.controller.js';

const router = express.Router();

router.get('/:productId', getPriceHistory);

export default router;