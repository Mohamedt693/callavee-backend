import Store from "../models/store.model.js";
import { STORE_MESSAGES } from '../../../utils/messages/store.messages.js';

export const getStoreFilters = async (req, res) => {
    try {
        const filters = await Store.find({}, 'name slug').sort({ name: 1 });
        res.status(200).json({ success: true, message: STORE_MESSAGES.SUCCESS.RETRIEVED_FILTERS, data: filters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};