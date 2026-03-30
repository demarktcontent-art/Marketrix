import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractProductInfo(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the product name and its selling price from this URL: ${url}. 
      If multiple prices are found, use the current selling price. 
      Return the data in JSON format.`,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the product.",
            },
            price: {
              type: Type.NUMBER,
              description: "The selling price of the product.",
            },
          },
          required: ["name", "price"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as { name: string; price: number };
  } catch (error) {
    console.error("Error extracting product info:", error);
    throw error;
  }
}
