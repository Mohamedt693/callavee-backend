import { geminiModel } from "../../config/gemini.js";
import Product from "../../products/models/product.model.js";

export const handleConsultation = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    const relevantProducts = await Product.aggregate([
      {
        $vectorSearch: {
          index: "product_vector_index",
          path: "description",
          query: message,
          limit: 5,
          numCandidates: 100,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          images: 1,
          currentPrice: 1,
          ingredients: 1,
          lastPrice: 1,
          currency: 1,
          versions: 1,
          features: 1,
          brandName: 1,
        },
      },
    ]);

    const productsContext =
      relevantProducts.length > 0
        ? JSON.stringify(relevantProducts)
        : "I couldn't find a perfect match for your specific need, but based on my dermatological expertise, I'd be happy to recommend some excellent alternatives from our curated collection. Please let me know if you'd like me to proceed with those.";

    const systemPrompt = `
            You are a professional dermatologist and the intelligent assistant for "${process.env.BRAND_NAME || "CallaVee"}".

            LANGUAGE PROTOCOL:
            - If Arabic: Speak in a friendly, approachable Egyptian dialect tailored for women, maintaining a reliable and persuasive medical tone.
            - If other: Speak in a professional, expert, and friendly tone.

            CORE MISSION:
            1. Investigation: You MUST identify the user's "Skin Type" and "Main Concern". If missing, ask politely. DO NOT suggest products until you have both.
            2. Product Selection: Use ONLY these relevant products: ${productsContext}

            RULES:
            1. Premium-First Strategy: Recommend high-end products as the core routine.
            2. Cross-selling: Suggest a complementary product as a mandatory step.
            3. Smart Downselling: After presenting premium options, add: "These are for fast results. If you need budget-friendly alternatives, just ask!"
            4. Product Format:
                - Name: [Title]
                - Description: [Medical benefits]
                - Image: ![Name](image_url)
                - Price: [Price] [Currency]
                - FOMO: If price dropped, mention the discount enthusiastically!
            5. Safety: ONLY discuss skincare. If bypassed, reply: "I am here to care for your beauty and skin only! 🥰"
            6. Ingredient Expert: If a user asks about what's inside a product, use the "ingredients" field to explain the medical benefits of each component clearly and simply.
            7. Branding & Human Touch: Always sign off or frame your assistance as coming from the "CallaVee Team". Use phrases like "The CallaVee team is here to support you on your skincare journey" or "We at CallaVee are committed to your skin's health and radiance."
        `;

    const recentHistory = (chatHistory || []).slice(-10);
    const formattedHistory = recentHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = geminiModel.startChat({
      history: formattedHistory,
      generationConfig: { temperature: 0.5 },
      systemInstruction: { parts: [{ text: systemPrompt }] },
    });

    const result = await chat.sendMessage(message);

    return res.status(200).json({
      success: true,
      data: {
        recommendation: result.response.text(),
        recommendedProducts: relevantProducts,
      },
    });
  } catch (error) {
    console.error("Consultation Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
