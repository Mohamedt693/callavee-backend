import SkinType from '../models/skinType.model.js';
import slugify from 'slugify';
import { SKIN_TYPE_MESSAGES } from '../../../utils/messages/skinType.messages.js';



export const createSkinType = async (req, res) => {
    try {
        const { name, description, characteristics, isFeatured } = req.body;

        const slug = slugify(name, { lower: true, trim: true });

        // Check if skin type already exists
        const existingSkinType = await SkinType.findOne({ slug });
        if (existingSkinType) {
            return res.status(400).json({ success: false, message: SKIN_TYPE_MESSAGES.ERRORS.ALREADY_EXISTS });
        }

        const skinType = await SkinType.create({
            name,
            slug,
            description,
            characteristics,
            isFeatured
        });

        res.status(201).json({
            success: true,
            message: SKIN_TYPE_MESSAGES.SUCCESS.CREATED,
            data: skinType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSkinType = async (req, res) => {
    try {
        const { name, description, characteristics, isFeatured } = req.body;

        let skinType = await SkinType.findById(req.params.id);
        if (!skinType) {
            return res.status(404).json({ success: false, message: SKIN_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        const updateData = {
            description,
            characteristics,
            isFeatured
        };

        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true, trim: true });
        }

        skinType = await SkinType.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: SKIN_TYPE_MESSAGES.SUCCESS.UPDATED,
            data: skinType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSkinType = async (req, res) => {
    try {
        const skinType = await SkinType.findById(req.params.id);
        if (!skinType) {
            return res.status(404).json({ success: false, message: SKIN_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        await skinType.deleteOne();

        res.status(200).json({
            success: true,
            message: SKIN_TYPE_MESSAGES.SUCCESS.DELETED
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};