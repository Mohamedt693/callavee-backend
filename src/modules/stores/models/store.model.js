import mongoose from 'mongoose';
import Offer from '../../Offers/models/offer.model.js'

const storeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    baseUrl: { 
        type: String 
    },
    logo: { 
        type: String 
    },
}, { 
    timestamps: true 
});



storeSchema.virtual("offers", {
    ref: "Offer",
    localField: "_id",
    foreignField: "store", 
});


storeSchema.set('toJSON', { virtuals: true });
storeSchema.set('toObject', { virtuals: true });


storeSchema.pre("findOneAndDelete", async function (next) {
    const storeId = this.getFilter()._id; 
    if (storeId) {
        await Offer.deleteMany({ store: storeId });
    }
});

const Store = mongoose.model('Store', storeSchema);

export default Store;