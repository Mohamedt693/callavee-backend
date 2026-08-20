import SkinType from '../models/skinType.model.js';
import { SKIN_TYPE_MESSAGES } from '../../../utils/messages/skinType.messages.js';

export const getSkinTypesFilters = async (req, res) => {
    try {
        const { search } = req.query;
        
        const query = search 
            ? { name: { $regex: search, $options: 'i' } } 
            : {};

        const filters = await SkinType.find(query, 'name slug')
            .limit(10)
            .sort({ name: 1 });

        res.status(200).json({ 
            success: true, 
            message: SKIN_TYPE_MESSAGES.SUCCESS.FILTERS_RETRIEVED,
            data: filters 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};