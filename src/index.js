import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import connectDB from './config/db.js'; 
import cookieParser from 'cookie-parser';
// middlewares
import { detectCountry } from './middlewares/country.middleware.js'
import { responseHandler } from './middlewares/responseHandler.js'; 
// Routes
import productRoutes from './modules/products/routes/product.route.js';
import brandRoutes from './modules/brands/routes/brand.route.js';
import offerRoutes from './modules/Offers/routes/offer.routes.js'
import authRoutes from './auth/routes/auth.routes.js';
import analyticsRoutes from './modules/analytics/routes/analytics.routes.js';
import priceHistoryRoutes from './modules/price-history/routes/priceHistory.routes.js';
import subscriberRoutes from './modules/subsciptions/routes/subscription.routes.js';
import consultationRoutes from './modules/bot/routes/consultation.routes.js';
import CategoryRoutes from './modules/categories/routes/category.route.js';
import IngredientsRoutes from './modules/Ingredients/routes/Ingredients.route.js';
import blogRoutes from './modules/blog/routes/blog.routes.js';
import scraperRoutes from './modules/scraper/routes/scraper.routes.js';
import toolsRoutes from './modules/tools/routes/tools.routes.js';
import searchRoutes from './modules/search/routes/search.route.js';
import protocolRoutes from './modules/protocols/routes/protocol.route.js';
import spotlightRoutes from './modules/spotlight/routes/spotlight.route.js';
import routineRoutes from './modules/routines/routes/routine.route.js';
import userRoutes from './modules/users/routes/user.route.js';
import contactRoutes from './modules/contact/routes/contact.routes.js';
import storesRoutes from './modules/stores/routes/store.route.js';
import guidelineRoutes from './modules/Guideline/routes/guideline.routes.js';
import skinTypeRoutes from './modules/Skin-types/routes/skinType.route.js';
import quickTipRoutes from './modules/quick-tips/routes/quickTip.route.js';

// cron jobs
import { initScraper } from './modules/scraper/controllers/scraper.controller.js';


const app = express();


// Middleware
app.use(cookieParser());
app.set('trust proxy', 1); 
app.use(helmet());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.DASHBOARD_URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(responseHandler);
app.use(express.json());
app.use(detectCountry);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calla', consultationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/ingredients', IngredientsRoutes);
app.use('/api/price-history', priceHistoryRoutes); 
app.use('/api/subscriptions', subscriberRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/interactions', analyticsRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/spotlights', spotlightRoutes);
app.use('/api/routines', routineRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/guidelines', guidelineRoutes);
app.use('/api/skin-types', skinTypeRoutes);
app.use('/api/quick-tips', quickTipRoutes);



// MongoDB connection
connectDB().then(() => {
    initScraper(); 
    console.log("Scraper initialized");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`CallaVee Backend running on port ${PORT}`);
});
