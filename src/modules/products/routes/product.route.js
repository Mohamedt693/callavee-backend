import express from 'express';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

import { 
    addProduct, updateProduct, deleteProduct 
} from '../controllers/product.controller.js';

import { 
    getAllProducts, getProductBySlug, getProductById,
    getProductsByIds, getTopSellers, getFeaturedProducts 
} from '../controllers/product.query.controller.js';

import { getFilterOptions, searchFilterItems } from '../controllers/product.filter.controller.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/filters', getFilterOptions); 
router.get('/filters/:type', searchFilterItems);
router.get('/top-sellers', getTopSellers); 
router.get('/featured', getFeaturedProducts); 
router.get('/bulk', getProductsByIds); 
router.get('/slug/:slug', getProductBySlug); 
router.get('/:id', getProductById); 


router.post('/', protectAdmin, addProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

export default router;