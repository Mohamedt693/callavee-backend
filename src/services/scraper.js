import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.BRIGHT_DATA_API_KEY;

export const fetchProductPrice = async (storeName, identifier) => {
    let url;
    let datasetId;

    // Map stores to their respective logic
    switch (storeName) {
        case 'amazon':
            url = `https://www.amazon.com/dp/${identifier}`;
            datasetId = process.env.AMAZON_DS_ID;
            break;
        case 'sephora':
            url = `https://www.sephora.com/product/${identifier}`;
            datasetId = process.env.SEPHORA_DS_ID;
            break;
        case 'ulta':
            url = `https://www.ulta.com/p/${identifier}`;
            datasetId = process.env.ULTA_DS_ID;
            break;
        case 'target':
            url = `https://www.target.com/p/${identifier}`;
            datasetId = process.env.TARGET_DS_ID;
            break;
        default:
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
        console.error(`Error scraping ${storeName} for ${identifier}:`, error.message);
        return null;
    }
};