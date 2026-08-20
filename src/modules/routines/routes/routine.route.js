import express from 'express';
import { saveRoutine, getMyRoutine, deleteRoutine, getDashboardAnalytics } from '../controllers/routine.controller.js';
import { protectUser } from '../../users/middlewares/user.middleware.js';
import { protectAdmin} from '../../../middlewares/auth.middleware.js'

const router = express.Router();


router.get('/analytics',  protectAdmin, getDashboardAnalytics);

router.get('/my-routine', protectUser, getMyRoutine);
router.post('/save', protectUser, saveRoutine);
router.delete('/delete', protectUser, deleteRoutine);

export default router;