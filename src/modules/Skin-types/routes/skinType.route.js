import express from 'express';
import {
    
    createSkinType,
    updateSkinType,
    deleteSkinType
} from '../controllers/skinType.controller.js';
import { getSkinTypeById, getAllSkinTypes } from '../controllers/skinType.query.controller.js';
import { getSkinTypesFilters } from '../controllers/skinType.filter.controller.js';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/filters').get(getSkinTypesFilters);

router.route('/')
    .get(getAllSkinTypes)
    .post(protectAdmin, createSkinType);

router.route('/:id')
    .get(getSkinTypeById)
    .put(protectAdmin, updateSkinType)
    .delete(protectAdmin, deleteSkinType);

export default router;