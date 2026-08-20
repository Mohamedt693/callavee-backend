import express from 'express';
import { handleConsultation, getConsultationAnalytics } from '../controllers/consultation.controller.js';

import { protectAdmin } from '../../../middlewares/auth.middleware.js';
const router = express.Router();


router.post('/consultation', handleConsultation);
router.get('/analytics', protectAdmin, getConsultationAnalytics);

export default router;