import express from "express";
import { protectAdmin } from '../../../middlewares/auth.middleware.js';
import {
  addOffer,
  updateOffer,
  updateOfferByParams, // for scraper
  deleteOffer,
} from "../controllers/offer.controller.js";

import {   
  getOffers,
  getOffersByProduct,
  getOfferById, 
} from "../controllers/offer.quey.controller.js";

const router = express.Router();

router.get("/", getOffers);
router.get("/product/:productId", getOffersByProduct);
router.get("/:offerId", getOfferById);

router.post("/", protectAdmin, addOffer);
router.post("/upsert", protectAdmin, updateOfferByParams);
router.patch("/:offerId", protectAdmin, updateOffer);
router.delete("/:offerId", protectAdmin, deleteOffer);

export default router;
