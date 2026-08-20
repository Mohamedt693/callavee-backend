import Store from '../models/store.model.js';
import Offer from '../../Offers/models/offer.model.js';
import slugify from 'slugify';
import { STORE_MESSAGES } from '../../../utils/messages/store.messages.js';

export const createStore = async (req, res) => {
    try {
        const { name, baseUrl, logo } = req.body;
        
        const slug = slugify(name, { 
            lower: true, 
            strict: true, 
            trim: true 
        });
        
        const newStore = new Store({ name, slug, baseUrl, logo });
        await newStore.save();
        res.status(201).json({ success: true, message: STORE_MESSAGES.SUCCESS.CREATED, data: newStore });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true, trim: true });
        }

        const updatedStore = await Store.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });
        
        if (!updatedStore) return res.status(404).json({ success: false, message: STORE_MESSAGES.ERRORS.NOT_FOUND });
        res.status(200).json({ success: true, message: STORE_MESSAGES.SUCCESS.UPDATED, data: updatedStore });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStore = await Store.findOneAndDelete({ _id: id });
        if (!deletedStore) return res.status(404).json({ success: false, message: STORE_MESSAGES.ERRORS.NOT_FOUND });
        res.status(200).json({ success: true, message: STORE_MESSAGES.SUCCESS.DELETED });
    } catch (error) {
        res.status(500).json({ success: false, message: STORE_MESSAGES.ERRORS.DELETE_ERROR });
    }
};