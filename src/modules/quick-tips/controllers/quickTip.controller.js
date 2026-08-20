import slugify from 'slugify';
import QuickTip from '../models/quickTip.model.js';


const calculateReadTime = (content) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
};


export const getAllTips = async (req, res) => {
    try {
        const tips = await QuickTip.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tips.length,
            data: tips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


export const getTipById = async (req, res) => {
    try {
        const tip = await QuickTip.findById(req.params.id);
        
        if (!tip) {
            return res.status(404).json({
                success: false,
                message: 'Tip not found'
            });
        }

        res.status(200).json({
            success: true,
            data: tip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


export const createTip = async (req, res) => {
    try {
        const { title, fullContent } = req.body;

        const slug = slugify(title, { lower: true, strict: true });

        const readTime = calculateReadTime(fullContent);

        const newTip = await QuickTip.create({
            ...req.body,
            slug,
            readTime
        });

        res.status(201).json({
            success: true,
            data: newTip
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data provided',
            error: error.message
        });
    }
};


export const updateTip = async (req, res) => {
    try {
        const { title, fullContent } = req.body;
        const updateData = { ...req.body };

        if (title) {
            updateData.slug = slugify(title, { lower: true, strict: true });
        }

        if (fullContent) {
            updateData.readTime = calculateReadTime(fullContent);
        }

        const updatedTip = await QuickTip.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedTip) {
            return res.status(404).json({
                success: false,
                message: 'Tip not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedTip
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Update failed',
            error: error.message
        });
    }
};


export const deleteTip = async (req, res) => {
    try {
        const tip = await QuickTip.findByIdAndDelete(req.params.id);

        if (!tip) {
            return res.status(404).json({
                success: false,
                message: 'Tip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tip deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};