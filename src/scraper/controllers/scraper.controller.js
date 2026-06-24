import cron from 'node-cron';
import { Scraper } from '../models/scraper.model.js';
import { runPriceUpdate } from '../../utils/jobs/priceUpdater.js';


let currentTask = null;

const scheduleTask = (cronExpression) => {

    if (currentTask) {
        currentTask.stop();
    }

    currentTask = cron.schedule(cronExpression, async () => {
        console.log(`[Cron Job] Executing at: ${new Date().toISOString()}`);
        await runPriceUpdate();
    });
    
    console.log(`[Cron Job] Task scheduled with expression: ${cronExpression}`);
};


export const initScraper = async () => {
    let config = await Scraper.findOne({ jobName: 'price-update' });
    
    if (!config) {
        config = await Scraper.create({}); 
    }

    if (config.isActive) {
        scheduleTask(config.cronExpression);
    }
};

export const updateScraperSettings = async (req, res) => {
    try {
        const { cronExpression, isActive } = req.body;

        if (cronExpression && !cron.validate(cronExpression)) {
            return res.status(400).json({ success: false, message: "Invalid cron expression format." });
        }

        const config = await Scraper.findOneAndUpdate(
            { jobName: 'price-update' },
            { cronExpression, isActive },
            { new: true, upsert: true }
        );

        if (config.isActive) {
            scheduleTask(config.cronExpression);
            res.json({ success: true, message: "Cron updated and started.", config });
        } else {
            if (currentTask) currentTask.stop();
            res.json({ success: true, message: "Cron stopped.", config });
        }
    } catch (error) {
        console.error("Error updating cron:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const getScraperSettings = async (req, res) => {
    try {
        const config = await Cron.findOne({ jobName: 'price-update' });
        if (!config) {
            return res.status(404).json({ success: false, message: "Config not found" });
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};