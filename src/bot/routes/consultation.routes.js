import express from 'express';
import { handleConsultation } from '../controllers/consultation.controller.js';

const router = express.Router();


router.post('/consultation', handleConsultation);

export default router;