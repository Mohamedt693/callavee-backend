import TargetType from '../models/targetType.model.js';
import { TARGET_TYPE_MESSAGES } from '../../../utils/messages/targetType.messages.js';

export const getTargetTypeById = async (req, res) => {
    try {
        const targetType = await TargetType.findById(req.params.id);

        if (!targetType) {
            return res.status(404).json({ success: false, message: TARGET_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        res.status(200).json({
            success: true,
            message: TARGET_TYPE_MESSAGES.SUCCESS.RETRIEVED_ONE,
            data: targetType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllTargetTypes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search, isFeatured, type } = req.query;

        const matchQuery = {};
        
        if (type) matchQuery.type = type;
        if (search) matchQuery.name = { $regex: search, $options: 'i' };
        if (isFeatured !== undefined) matchQuery.isFeatured = isFeatured === 'true';

        const total = await TargetType.countDocuments(matchQuery);
        const targetTypes = await TargetType.find(matchQuery)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: TARGET_TYPE_MESSAGES.SUCCESS.RETRIEVED,
            count: targetTypes.length,
            data: {
                targetTypes,
                pagination: {
                    totalTargetTypes: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};