import express from 'express';
import { 
    getGuidelines, 
    createGuideline, 
    updateGuideline, 
    deleteGuideline 
} from '../controllers/guideline.controller.js';

const router = express.Router();

router.get('/', getGuidelines);
router.post('/', createGuideline);

router.put('/:id', updateGuideline);
router.delete('/:id', deleteGuideline);

export default router;