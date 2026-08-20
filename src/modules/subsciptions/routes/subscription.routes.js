import express from "express";
import {
  addSubscriber,
  getSubscribers,
} from "../controllers/subscription.controller.js";
import rateLimit from "express-rate-limit";

const subscriptionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post("/subscribe", subscriptionLimiter, addSubscriber);

router.get("/", getSubscribers);

export default router;