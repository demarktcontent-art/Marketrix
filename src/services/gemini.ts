import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMarketingContent = async (product: { name: string, description: string, platform: string }) => {
  const prompt = `
    Generate a high-converting marketing content for the following product:
    Product Name: ${product.name}
    Description: ${product.description}
    Target Platform: ${product.platform}
    
    The content should include:
    1. A catchy title/headline.
    2. A persuasive body text.
    3. 5 relevant hashtags.
    
    Format the output as JSON:
    {
      "title": "...",
      "body": "...",
      "hashtags": ["...", "...", "..."]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text;
    // Basic JSON extraction from markdown if needed
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
