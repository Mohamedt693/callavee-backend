import crypto from "crypto";
import { Subscriber } from '../models/subscription.model.js';
import Product from '../../products/models/product.model.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../../services/email.service.js';

export const toggleSubscription = async (req, res) => {
  try {
    const { email, productId, type, action } = req.body;

    if (!email || !type || !action) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (action === "unsubscribe") {
      await Subscriber.updateOne(
        { email },
        { $pull: { subscriptions: { type, productId: productId || null } } },
      );
      return res
        .status(200)
        .json({ message: `Unsubscribed from ${type} successfully.` });
    }

    if (action === "subscribe") {
      let category = type === "newsletter" ? "Newsletter" : "General";

      if (type === "product") {
        if (!productId)
          return res.status(400).json({ message: "Product ID required" });
        const product = await Product.findById(productId);
        if (!product)
          return res.status(404).json({ message: "Product not found" });
        category = product.category;
      }

      const subData = {
        type,
        productId: productId || null,
        category,
        addedAt: new Date(),
      };

      let sub = await Subscriber.findOne({ email });

      if (!sub) {
        const token = crypto.randomBytes(32).toString("hex");
        await Subscriber.create({
          email,
          status: "pending",
          verificationToken: token,
          subscriptions: [subData],
        });

        await sendVerificationEmail(
          email,
          `${process.env.BASE_URL}/api/subscribe/verify?token=${token}`,
        );
        return res
          .status(200)
          .json({ message: "Please check your email to confirm!" });
      }

      await Subscriber.updateOne(
        { email },
        { $addToSet: { subscriptions: subData } },
      );
      return res
        .status(200)
        .json({ message: `Subscribed to ${type} successfully!` });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifySubscription = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.redirect(`${process.env.FRONTEND_URL}/status?status=error`);

    const sub = await Subscriber.findOneAndUpdate(
      { verificationToken: token },
      { $set: { status: "active" }, $unset: { verificationToken: "" } },
      { new: true },
    ).populate("subscriptions.productId", "title");

    if (!sub)
      return res.redirect(`${process.env.FRONTEND_URL}/status?status=error`);

    await sendWelcomeEmail(sub.email, sub.subscriptions);
    res.redirect(`${process.env.FRONTEND_URL}/status?status=success`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/status?status=error`);
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await Subscriber.aggregate([
      { $match: { status: "active" } },
      { $unwind: "$subscriptions" },
      {
        $facet: {
          data: [
            {
              $lookup: {
                from: "products",
                localField: "subscriptions.productId",
                foreignField: "_id",
                as: "p",
              },
            },
            {
              $project: {
                _id: 0,
                email: 1,
                type: "$subscriptions.type",
                category: "$subscriptions.category",
                productTitle: {
                  $ifNull: [{ $arrayElemAt: ["$p.title", 0] }, "N/A"],
                },
                addedAt: "$subscriptions.addedAt",
              },
            },
            { $skip: skip },
            { $limit: limit },
          ],
          metadata: [{ $count: "total" }],
        },
      },
    ]);

    const data = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    res.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubscribers: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};
