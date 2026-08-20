
import express from 'express';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';
import { submitContactMessage, getAllContactMessages, deleteContactMessage } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/', submitContactMessage);
router.get('/', protectAdmin, getAllContactMessages);
router.delete('/:id', protectAdmin, deleteContactMessage);

export default router;