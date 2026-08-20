import express from 'express';
import {
    getAllTips,
    getTipById,
    createTip,
    updateTip,
    deleteTip
} from '../controllers/quickTip.controller.js';

const router = express.Router();
import { protectAdmin } from "../../../middlewares/auth.middleware.js"

router.route('/')
    .get(getAllTips)
    .post(protectAdmin, createTip);

router.route('/:id')
    .get(getTipById)
    .put(protectAdmin, updateTip)
    .delete(protectAdmin, deleteTip);

export default router;