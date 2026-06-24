import express from 'express';
import { updateScraperSettings, getScraperSettings } from '../controllers/scraper.controller.js'; 

const router = express.Router();

router.get('/settings', getScraperSettings); 
router.post('/update', updateScraperSettings);

export default router;