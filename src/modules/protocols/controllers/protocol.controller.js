import slugify from "slugify";
import Protocol from '../models/protocol.model.js';
import TargetType from '../../target-types/models/targetType.model.js'; 
import { PROTOCOL_MESSAGES } from '../../../utils/messages/protocol.messages.js';
import cache from "../../../utils/functions/cache.js"; 

const invalidateFilterCache = () => {
    cache.del("filter_options");
};

export const createProtocol = async (req, res) => {
    try {
        const { title, description, highlights, routine, duration, targetTypes, targetConcerns, logo, isFeatured } = req.body;
        
        const dbTargetTypes = targetTypes ? await TargetType.find({ slug: { $in: targetTypes } }).distinct('_id') : [];

        const protocol = await Protocol.create({ 
            title, 
            description, 
            highlights, 
            routine, 
            duration, 
            targetTypes: dbTargetTypes, 
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

        if (updateData.targetTypes) {
            updateData.targetTypes = await TargetType.find({ slug: { $in: updateData.targetTypes } }).distinct('_id');
        }

        const protocol = await Protocol.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("targetTypes");
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });
        
        invalidateFilterCache();
        res.status(200).json({ success: true, data: protocol, message: PROTOCOL_MESSAGES.SUCCESS.UPDATED });
    } catch (error) {
        res.status(400).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.UPDATE_FAILED, error: error.message });
    }
};

export const deleteProtocol = async (req, res) => {
    try {
        const protocol = await Protocol.findByIdAndDelete(req.params.id);
        if (!protocol) return res.status(404).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.NOT_FOUND });
        
        invalidateFilterCache();
        
        res.status(200).json({ success: true, message: PROTOCOL_MESSAGES.SUCCESS.DELETED });
    } catch (error) {
        res.status(500).json({ success: false, message: PROTOCOL_MESSAGES.ERROR.DELETE_FAILED });
    }
};