import Subscriber  from '../models/subscription.model.js';
import { sendWelcomeEmail } from '../../../services/email.service.js';

export const addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.error("Email is required", 400);

        await Subscriber.create({ email });

        sendWelcomeEmail(email).catch(err => console.error("Email sending failed:", err));

        return res.success("Subscribed successfully!");
    } catch (error) {
        if (error.code === 11000) {
            return res.error("You are already subscribed", 400);
        }
        return res.error("Server error during subscription", 500, error);
    }
};


export const getSubscribers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [subscribers, total] = await Promise.all([
            Subscriber.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-__v"),
            Subscriber.countDocuments()
        ]);

        return res.success("Subscribers retrieved successfully", {
            data: subscribers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSubscribers: total,
            },
        });
    } catch (error) {
        return res.error("Error fetching subscribers", 500, error);
    }
};

