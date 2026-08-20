import Contact from '../models/contact.model.js';
import { CONTACT_MESSAGES } from '../../../utils/messages/contact.messages.js';

export const submitContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const newContact = await Contact.create({
            name,
            email,
            message,
        });

        return res.status(201).json({
            success: true,
            message: CONTACT_MESSAGES.SUCCESS.SENT,
            data: newContact,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || CONTACT_MESSAGES.ERRORS.SERVER_ERROR,
        });
    }
};

export const getAllContactMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([
            Contact.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Contact.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            message: CONTACT_MESSAGES.SUCCESS.RETRIEVED,
            count: messages.length,
            data: {
                messages,
                pagination: {
                    totalMessages,
                    totalPages: Math.ceil(totalMessages / limit),
                    currentPage: page,
                    limit,
                }
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || CONTACT_MESSAGES.ERRORS.SERVER_ERROR,
        });
    }
};

export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMessage = await Contact.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: CONTACT_MESSAGES.ERRORS.NOT_FOUND,
            });
        }

        return res.status(200).json({
            success: true,
            message: CONTACT_MESSAGES.SUCCESS.DELETED,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || CONTACT_MESSAGES.ERRORS.SERVER_ERROR,
        });
    }
};