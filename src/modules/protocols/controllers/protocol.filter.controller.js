import SkinProtocol from '../models/protocol.model.js';

export const getProtocolFilters = async (req, res) => {
    try {
        const { search } = req.query;
        
        const query = search 
            ? { title: { $regex: search, $options: 'i' } } 
            : {};

        const filters = await SkinProtocol.find(query, 'title slug')
            .limit(10)
            .sort({ title: 1 });

        res.status(200).json({ success: true, data: filters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};