import express from 'express';
import { 
    createIngredient, 
    getAllIngredients, 
    getIngredientBySlug, 
    getIngredientById, 
    updateIngredient, 
    deleteIngredient 
} from '../controllers/Ingredients.controller.js';
import { protectAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/', getAllIngredients);
router.get('/slug/:slug', getIngredientBySlug);
router.get('/:id', getIngredientById);


router.post('/', protectAdmin, createIngredient);
router.put('/:id', protectAdmin, updateIngredient);
router.delete('/:id', protectAdmin, deleteIngredient);

export default router;