import express from 'express';
import { 
    addProduct, 
    getAllProducts, 
    getProductBySlug, 
    getProductById,
    getProductsByIds, 
    getTopSellers,
    getFeaturedProducts,
    getRelatedProducts,
    toggleStoreAvailability,
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';
import { protectAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);

router.get('/top-sellers', getTopSellers); 
router.get('/featured', getFeaturedProducts); 

router.get('/bulk', getProductsByIds); 
router.get('/slug/:slug', getProductBySlug); 

router.get('/:id', getProductById); 
router.get('/:id/related', getRelatedProducts);

router.post('/', protectAdmin, addProduct);
router.put('/:id', protectAdmin, updateProduct);
router.patch('/:id/toggle', protectAdmin, toggleStoreAvailability);
router.delete('/:id', protectAdmin, deleteProduct);

export default router;