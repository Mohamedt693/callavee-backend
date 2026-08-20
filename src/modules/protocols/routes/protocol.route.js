import express from 'express';
import { 
    createProtocol, 
    updateProtocol, 
    deleteProtocol, 
} from '../controllers/protocol.controller.js';

import { getProtocolFilters } from '../controllers/protocol.filter.controller.js';

import { 
    getProtocols, 
    getProtocolById, 
    getProtocolBySlug,
    getFeaturedProtocols 
} from '../controllers/protocol.query.controller.js';

import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/filters', getProtocolFilters);

router.get('/featured', getFeaturedProtocols);

router.get('/', getProtocols);

router.get('/slug/:slug', getProtocolBySlug); 
router.get('/:id', getProtocolById);

router.post('/', protectAdmin, createProtocol);
router.route('/:id')
    .put(protectAdmin, updateProtocol)
    .delete(protectAdmin, deleteProtocol);

export default router;