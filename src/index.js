import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import connectDB from './config/db.js'; 
// middlewares
import {detectCountry} from './middlewares/country.middleware.js'
import { responseHandler } from './middlewares/responseHandler.js'; 
// Routes
import productRoutes from './products/routes/product.route.js';
import authRoutes from './auth/routes/auth.routes.js';
import analyticsRoutes from './analytics/routes/analytics.routes.js';
import priceHistoryRoutes from './price-history/routes/priceHistory.routes.js';
import subscriberRoutes from './subsciptions/routes/subscription.routes.js';
import consultationRoutes from './bot/routes/consultation.routes.js';
import CategoryRoutes from './categories/routes/category.route.js';
import IngredientsRoutes from './Ingredients/routes/Ingredients.route.js'
import blogRoutes from './blog/routes/blog.routes.js';
import scraperRoutes from './scraper/routes/scraper.routes.js'
// cron jobs
import { initScraper } from './scraper/controllers/scraper.controller.js';


const app = express();


// Middleware
app.set('trust proxy', 1); 
app.use(helmet());
app.use(cors());
app.use(responseHandler);
app.use(express.json());
app.use(detectCountry);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/ingredients', IngredientsRoutes);
app.use('/api/price-history', priceHistoryRoutes); 
app.use('/api', consultationRoutes);
app.use('/api/subscribe', subscriberRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/interactions', analyticsRoutes);
app.use('/api/scraper', scraperRoutes);


// MongoDB connection
connectDB().then(() => {
    initScraper(); 
    console.log("Scraper initialized");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`CallaVee Backend running on port ${PORT}`);
});
