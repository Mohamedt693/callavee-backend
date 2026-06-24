import mongoose from 'mongoose';

const scraperSchema = new mongoose.Schema({
    jobName: { type: String, default: 'price-update' },
    cronExpression: { type: String, default: '0 0 */2 * *' }, 
    isActive: { type: Boolean, default: true }
});

export const Scraper = mongoose.model('Scraper', scraperSchema);