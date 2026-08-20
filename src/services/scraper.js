import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.BRIGHT_DATA_API_KEY;

export const fetchProductPrice = async (storeName, identifier) => {
    if (storeName !== 'amazon') {
        console.warn(`Store ${storeName} is not supported.`);
        return null;
    }

    const url = `https://www.amazon.com/dp/${identifier}`;
    const datasetId = process.env.DATASET_ID;

    if (!datasetId) {
        console.error("DATASET_ID is missing in .env file!");
        return null;
    }

    try {
        const response = await axios.post(
            `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}`,
            [{ "url": url }], 
            { 
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
                params: { 'proxy_country': 'us' }
            }
        );
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
        console.error(`Error scraping Amazon for ${identifier}:`, error.message);
        return null;
    }
};