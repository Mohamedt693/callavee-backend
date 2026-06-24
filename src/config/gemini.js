import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables. Please add it to your .env file.');
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = ai.getGenerativeModel({ model: "gemini-2.5-flash" });