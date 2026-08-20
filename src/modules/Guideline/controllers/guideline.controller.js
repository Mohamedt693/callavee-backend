import Guideline from '../models/guideline.model.js';
import { GUIDELINE_MESSAGES } from '../../../utils/messages/guideline.messages.js';

export const getGuidelines = async (req, res) => {
    try {
        const guidelines = await Guideline.find().sort({ order: 1 });
        
        const dos = guidelines.filter(item => item.type === 'do');
        const donts = guidelines.filter(item => item.type === 'dont');

        res.status(200).json({
            success: true,
            message: GUIDELINE_MESSAGES.SUCCESS.RETRIEVED,
            data: {
                dos,
                donts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: GUIDELINE_MESSAGES.ERRORS.SERVER_ERROR,
            error: error.message
        });
    }
};

export const createGuideline = async (req, res) => {
    try {
        const { type, text, order } = req.body;

        const guideline = await Guideline.create({
            type,
            text,
            order
        });

        res.status(201).json({
            success: true,
            message: GUIDELINE_MESSAGES.SUCCESS.CREATED,
            data: guideline
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: GUIDELINE_MESSAGES.ERRORS.INVALID_DATA,
            error: error.message
        });
    }
};

export const updateGuideline = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, text, order } = req.body;

        const updatedGuideline = await Guideline.findByIdAndUpdate(
            id,
            { type, text, order },
            { new: true, runValidators: true }
        );

        if (!updatedGuideline) {
            return res.status(404).json({
                success: false,
                message: GUIDELINE_MESSAGES.ERRORS.NOT_FOUND
            });
        }

        res.status(200).json({
            success: true,
            message: GUIDELINE_MESSAGES.SUCCESS.UPDATED,
            data: updatedGuideline
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: GUIDELINE_MESSAGES.ERRORS.INVALID_DATA_OR_ID,
            error: error.message
        });
    }
};

export const deleteGuideline = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedGuideline = await Guideline.findByIdAndDelete(id);

        if (!deletedGuideline) {
            return res.status(404).json({
                success: false,
                message: GUIDELINE_MESSAGES.ERRORS.NOT_FOUND
            });
        }

        res.status(200).json({
            success: true,
            message: GUIDELINE_MESSAGES.SUCCESS.DELETED
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: GUIDELINE_MESSAGES.ERRORS.SERVER_ERROR,
            error: error.message
        });
    }
};