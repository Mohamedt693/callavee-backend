import express from 'express';
import { 
    createSpotlight, 
    getSpotlights, 
    updateSpotlight, 
    deleteSpotlight 
} from '../controllers/spotlight.controller.js';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getSpotlights);

router.post('/', protectAdmin, createSpotlight);
router.put('/:id', protectAdmin, updateSpotlight);
router.delete('/:id', protectAdmin, deleteSpotlight);

export default router;