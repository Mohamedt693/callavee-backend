import TargetType from '../models/targetType.model.js';
import { TARGET_TYPE_MESSAGES } from '../../../utils/messages/targetType.messages.js';

export const getTargetTypesFilters = async (req, res) => {
    try {
        const { search, type } = req.query;
        const query = {};

        if (type) query.type = type;
        if (search) query.name = { $regex: search, $options: 'i' };

        const filters = await TargetType.find(query, 'type name slug')
            .limit(10)
            .sort({ name: 1 });

        res.status(200).json({ 
            success: true, 
            message: TARGET_TYPE_MESSAGES.SUCCESS.FILTERS_RETRIEVED,
            data: filters 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};