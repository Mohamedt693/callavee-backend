import Brand from '../models/brand.model.js';
import { BRAND_MESSAGES } from '../../../utils/messages/brand.messages.js';

export const getBrandFilters = async (req, res) => {
    try {
        const { search } = req.query;
        
        const query = search 
            ? { name: { $regex: search, $options: 'i' } } 
            : {};

        const filters = await Brand.find(query, 'name slug')
            .limit(10)
            .sort({ name: 1 });

        res.status(200).json({ success: true, data: filters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};