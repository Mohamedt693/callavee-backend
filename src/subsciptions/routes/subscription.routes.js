import express from "express";
import {
  toggleSubscription,
  verifySubscription,
  getSubscribers,
} from "../controllers/subscription.controller.js";
import { Subscriber } from "../models/subscription.model.js";
import rateLimit from "express-rate-limit";

const subscriptionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post("/toggle", subscriptionLimiter, toggleSubscription);

router.get("/verify", verifySubscription);

router.get("/status", async (req, res) => {
  try {
    const { email, productId, type } = req.query;

    const sub = await Subscriber.findOne({
      email,
      status: "active",
      subscriptions: {
        $elemMatch: {
          type: type,
          productId: productId || null,
        },
      },
    });

    res.json({ isSubscribed: !!sub });
  } catch (error) {
    res.status(500).json({ message: "Error checking status" });
  }
});

router.get("/subscribers-report", getSubscribers);

export default router;
