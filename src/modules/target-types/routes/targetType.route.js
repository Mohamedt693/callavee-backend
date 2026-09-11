import express from 'express';
import {
    createTargetType,
    updateTargetType,
    deleteTargetType
} from '../controllers/targetType.controller.js';
import { 
    getTargetTypeById, 
    getAllTargetTypes 
} from '../controllers/targetType.query.controller.js';
import { 
    getTargetTypesFilters 
} from '../controllers/targetType.filter.controller.js';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/filters').get(getTargetTypesFilters);

router.route('/')
    .get(getAllTargetTypes)
    .post(protectAdmin, createTargetType);

router.route('/:id')
    .get(getTargetTypeById)
    .put(protectAdmin, updateTargetType)
    .delete(protectAdmin, deleteTargetType);

export default router;