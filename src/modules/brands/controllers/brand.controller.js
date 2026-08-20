import slugify from "slugify";
import Brand from '../models/brand.model.js';
import cache from "../../../utils/functions/cache.js"; 
import { BRAND_MESSAGES } from '../../../utils/messages/brand.messages.js';

const invalidateFilterCache = () => {
    cache.del("filter_options");
};

export const createBrand = async (req, res) => {
    try {
        const { name, description, logo, website, country, isFeatured } = req.body;
        const brand = await Brand.create({ 
            name, slug: slugify(name, { lower: true, strict: true }), 
            description, logo, website, country, isFeatured 
        });
        
        invalidateFilterCache();
        
        res.status(201).json({ success: true, message: BRAND_MESSAGES.SUCCESS.CREATED, data: brand });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, logo, website, country, isFeatured } = req.body;
        const updateData = { name, description, logo, website, country, isFeatured };
        if (name) updateData.slug = slugify(name, { lower: true, strict: true });

        const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!brand) return res.status(404).json({ success: false, message: BRAND_MESSAGES.ERRORS.NOT_FOUND });
        
        invalidateFilterCache();
        
        res.status(200).json({ success: true, message: BRAND_MESSAGES.SUCCESS.UPDATED, data: brand });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ success: false, message: BRAND_MESSAGES.ERRORS.NOT_FOUND });
        
        invalidateFilterCache();
        
        res.status(200).json({ success: true, message: BRAND_MESSAGES.SUCCESS.DELETED });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};