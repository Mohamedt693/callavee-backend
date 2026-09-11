import TargetType from '../models/targetType.model.js';
import slugify from 'slugify';
import { TARGET_TYPE_MESSAGES } from '../../../utils/messages/targetType.messages.js';

export const createTargetType = async (req, res) => {
    try {
        const { type, name, description, characteristics, isFeatured } = req.body;
        const slug = slugify(name, { lower: true, trim: true });

        const existingTargetType = await TargetType.findOne({ type, slug });
        if (existingTargetType) {
            return res.status(400).json({ success: false, message: TARGET_TYPE_MESSAGES.ERRORS.ALREADY_EXISTS });
        }

        const targetType = await TargetType.create({
            type,
            name,
            slug,
            description,
            characteristics,
            isFeatured
        });

        res.status(201).json({
            success: true,
            message: TARGET_TYPE_MESSAGES.SUCCESS.CREATED,
            data: targetType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTargetType = async (req, res) => {
    try {
        const { type, name, description, characteristics, isFeatured } = req.body;

        let targetType = await TargetType.findById(req.params.id);
        if (!targetType) {
            return res.status(404).json({ success: false, message: TARGET_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        const updateData = { description, characteristics, isFeatured };

        if (type) updateData.type = type;
        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true, trim: true });
        }

        targetType = await TargetType.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: TARGET_TYPE_MESSAGES.SUCCESS.UPDATED,
            data: targetType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTargetType = async (req, res) => {
    try {
        const targetType = await TargetType.findById(req.params.id);
        if (!targetType) {
            return res.status(404).json({ success: false, message: TARGET_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        await targetType.deleteOne();

        res.status(200).json({
            success: true,
            message: TARGET_TYPE_MESSAGES.SUCCESS.DELETED
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};