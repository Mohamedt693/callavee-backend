import mongoose from 'mongoose';

const spotlightSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['product', 'ingredient', 'brand'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    targetSlug: { type: String, required: true },
    image: { type: String } 
});

const Spotlight = mongoose.model('Spotlight', spotlightSchema);
export default Spotlight;