import express from 'express';
import { 
    createStore, 
    updateStore, 
    deleteStore,
    
} from '../controllers/store.controller.js'; 
import { getAllStores, getStoreOffers } from '../controllers/store.query.controller.js';
import { getStoreFilters } from '../controllers/store.filter.controller.js';

import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/filters", protectAdmin, getStoreFilters);
router.get("/offers", protectAdmin, getStoreOffers);


router.get("/", protectAdmin, getAllStores);

router.post('/', protectAdmin, createStore);

router.put('/:id', protectAdmin, updateStore);

router.delete('/:id', protectAdmin, deleteStore);

export default router;