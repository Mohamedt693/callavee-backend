import slugify from "slugify";
import SkinProtocol from '../models/protocol.model.js';
import SkinType from '../../Skin-types/models/skinType.model.js'; 
import { PROTOCOL_MESSAGES } from '../../../utils/messages/protocol.messages.js';
import cache from "../../../utils/functions/cache.js"; 

const invalidateFilterCache = () => {
    cache.del("filter_options");
};

export const createProtocol = async (req, res) => {
    try {
        const { title, description, highlights, routine, duration, targetSkinType, targetConcerns, logo, isFeatured } = req.body;
        
        const dbSkinTypes = targetSkinType ? await SkinType.find({ slug: { $in: targetSkinType } }).distinct('_id') : [];

        const protocol = await SkinProtocol.create({ 
            title, 
            description, 
            highlights, 
            routine, 
            duration, 
            targetSkinType: dbSkinTypes, 
            targetConcerns, 
            logo, 
            isFeatured,
            slug: slugify(title, { lower: true, strict: true }) 
        });
        
        invalidateFilterCache();
        res.status(201).json({ success: true, data: protocol, message: PROTOCOL_MESSAGES.SUCCESS.CREATED });
    } catch (error) {
        res.status(400).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.CREATE_FAILED, error: error.message });
    }
};

export const updateProtocol = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body }; 
        
        if (updateData.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        if (updateData.targetSkinType) {
            updateData.targetSkinType = await SkinType.find({ slug: { $in: updateData.targetSkinType } }).distinct('_id');
        }

        const protocol = await SkinProtocol.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("targetSkinType");
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });
        
        invalidateFilterCache();
        res.status(200).json({ success: true, data: protocol, message: PROTOCOL_MESSAGES.SUCCESS.UPDATED });
    } catch (error) {
        res.status(400).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.UPDATE_FAILED, error: error.message });
    }
};

export const deleteProtocol = async (req, res) => {
    try {
        const protocol = await SkinProtocol.findByIdAndDelete(req.params.id);
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });
        
        invalidateFilterCache();
        
        res.status(200).json({ success: true, message: PROTOCOL_MESSAGES.SUCCESS.DELETED });
    } catch (error) {
        res.status(500).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.DELETE_FAILED });
    }
};