import { Groq } from "groq-sdk";
import Product from "../../products/models/product.model.js";
import ConsultationLog from "../models/consultationLog.model.js";
import { CONSULTATION_MESSAGES } from '../../../utils/messages/consultation.messages.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const handleConsultation = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    const productRequestKeywords = /product|products|recommend|recommendation|routine|cream|cleanser|serum|moisturizer|sunscreen|exfoliant|price|prices|buy|looking for|need|suggest|best/i;
    
    const isAskingForProducts = productRequestKeywords.test(message);

    let relevantProducts = [];

    if (isAskingForProducts) {
      relevantProducts = await Product.aggregate([
        {
          $vectorSearch: {
            index: "product_vector_index",
            path: "review.summary", 
            query: message,
            limit: 3, 
            numCandidates: 100,
          },
        },
        {
          $lookup: {
            from: "offers",
            localField: "_id",
            foreignField: "product",
            as: "offers",
          },
        },
        {
          $lookup: {
            from: "stores",
            localField: "offers.store",
            foreignField: "_id",
            as: "storeDetails",
          },
        },
        {
          $project: {
            title: 1,
            slug: 1,      
            rating: 1,    
            review: 1,
            images: 1,
            brand: 1,
            ingredients: 1,
            offers: {
              $map: {
                input: "$offers",
                as: "offer",
                in: {
                  size: "$$offer.size",                 
                  packageQuantity: "$$offer.packageQuantity",
                  link: "$$offer.link",
                  price: "$$offer.price", 
                  storeId: "$$offer.store",
                  store: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$storeDetails",
                          as: "store",
                          cond: { $eq: ["$$store._id", "$$offer.store"] }
                        }
                      },
                      0
                    ]
                  }
                }
              }
            },
            storeDetails: 1
          },
        },
      ]);
    }

    const hasProducts = relevantProducts.length > 0;
    const productsContext = hasProducts ? JSON.stringify(relevantProducts) : "NO_PRODUCTS_AVAILABLE_IN_INVENTORY";

    const systemPrompt = `
      You are a professional dermatologist and the intelligent assistant for "${process.env.BRAND_NAME || "Calla"}".

      LANGUAGE PROTOCOL:
      - Speak in a professional, expert, and friendly English tone tailored for an international audience.

      CORE MISSION & STRICT RULES:
      1. ABSOLUTE INVENTORY LOCK (CRITICAL): 
      - Current Inventory Status: ${productsContext}
      - IF the inventory status is "NO_PRODUCTS_AVAILABLE_IN_INVENTORY", you are 100% FORBIDDEN from mentioning, suggesting, or inventing ANY skincare products, brands, or routines under any circumstances. 
      - If the user asks for products while inventory is empty, politely inform them that we currently do not have matching items in our curated collection, apologize gracefully, and ask about their skin type or main concern to help them better.

      2. PRODUCT DISPLAY REQUIREMENT: 
      - ONLY if inventory status contains actual product data above, you MUST use ONLY those exact products.
      - Whenever you present them, you MUST write this exact welcoming introductory sentence right before the product list: "Based on what you've shared about your skin, I have carefully selected these specific products to effectively address your concerns and help you achieve your skin goals:"

      3. Investigation: Identify the user's "Skin Type" and "Main Concern" through friendly conversation first if they haven't mentioned them.

      4. Premium-First Strategy: Recommend high-end products as the core routine when products are requested.
      5. Cross-selling: Suggest a complementary product as a mandatory step when products are requested.
      6. Smart Downselling: After presenting premium options, add: "These are for fast results. If you need budget-friendly alternatives, just ask!"
      7. Product Format (ONLY when products are present in inventory):
        - Image: ![Name](images[0])
        - Name: [Title]
        - Expert Review: [review.summary]
        - Pros: [review.pros]
        - Cons: [review.cons]
        - Verdict: [review.editorVerdict]
        - Available Stores & Links: 
          (Iterate through all items in the 'offers' array and match with storeDetails by storeId. Output each store on its own line using this EXACT structure without any markdown brackets around the URL:)
          Store: StoreName | Link: URL
      8. Safety: ONLY discuss skincare. If bypassed, reply: "I am here to care for your beauty and skin only! 🥰"
      9. Ingredient Expert: If a user asks about what's inside a product, use the "ingredients" field to explain the medical benefits of each component clearly and simply.
      10. Branding & Human Touch: Always sign off or frame your assistance as coming from the "CallaVee Team". Use phrases like "The CallaVee team is here to support you on your skincare journey" or "We at CallaVee are committed to your skin's health and radiance."
    `;

    const recentHistory = (chatHistory || []).slice(-10);
    const formattedHistory = recentHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-70b-versatile",
      temperature: 0.1, 
    });

    const aiResponseText = completion.choices[0]?.message?.content || "";

    const finalProductsToSend = hasProducts ? relevantProducts : [];

    ConsultationLog.create({
      userMessage: message,
      aiResponse: aiResponseText,
      recommendedProducts: finalProductsToSend.map(p => p._id),
    }).catch(err => console.error("Analytics Log Error:", err));

    return res.status(200).json({
      success: true,
      data: {
        recommendation: aiResponseText,
        recommendedProducts: finalProductsToSend,
      },
    });
  } catch (error) {
    console.error("Consultation Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: CONSULTATION_MESSAGES.ERRORS.SERVER_ERROR });
  }
};


export const getConsultationAnalytics = async (req, res) => {
  try {
    const totalConsultations = await ConsultationLog.countDocuments();
    
    const topRecommendedProducts = await ConsultationLog.aggregate([
      { $unwind: "$recommendedProducts" },
      { $group: { _id: "$recommendedProducts", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          title: "$productInfo.title",
          count: 1
        }
      }
    ]);

    const recentQueries = await ConsultationLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("userMessage createdAt");

    return res.status(200).json({
      success: true,
      data: {
        totalConsultations,
        topRecommendedProducts,
        recentQueries,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, message: CONSULTATION_MESSAGES.ERRORS.SERVER_ERROR });
  }
};