import express from 'express';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

import { 
    createBrand, 
    updateBrand, 
    deleteBrand
} from '../controllers/brand.controller.js';

import { getBrandFilters } from '../controllers/brand.filter.controller.js';

import { 
    getBrands, 
    getBrandById, 
    getBrandBySlug,
    getFeaturedBrands,
} from '../controllers/brand.query.controller.js';

const router = express.Router();

router.get('/', getBrands);
router.get('/featured', getFeaturedBrands);
router.get('/filters', getBrandFilters); 


router.post('/', protectAdmin, createBrand);

router.get('/slug/:slug', getBrandBySlug);

router.route('/:id')
    .get(getBrandById)        
    .put(protectAdmin, updateBrand)
    .delete(protectAdmin, deleteBrand);

export default router;