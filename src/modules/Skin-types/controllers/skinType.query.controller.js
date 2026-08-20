import SkinType from '../models/skinType.model.js';
import { SKIN_TYPE_MESSAGES } from '../../../utils/messages/skinType.messages.js';


export const getSkinTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const skinType = await SkinType.findById(id);

        if (!skinType) {
            return res.status(404).json({ success: false, message: SKIN_TYPE_MESSAGES.ERRORS.NOT_FOUND });
        }

        res.status(200).json({
            success: true,
            message: SKIN_TYPE_MESSAGES.SUCCESS.RETRIEVED_ONE,
            data: skinType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSkinTypes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search, isFeatured } = req.query;

        let matchQuery = {};
        
        if (search) {
            matchQuery.name = { $regex: search, $options: 'i' };
        }

        if (isFeatured !== undefined) {
            matchQuery.isFeatured = isFeatured === 'true';
        }

        const total = await SkinType.countDocuments(matchQuery);
        
        const skinTypes = await SkinType.find(matchQuery)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: SKIN_TYPE_MESSAGES.SUCCESS.RETRIEVED,
            count: skinTypes.length,
            data: {
                skinTypes,
                pagination: {
                    totalSkinTypes: total,
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