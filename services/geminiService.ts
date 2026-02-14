import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to strip the data:image/png;base64, prefix
const cleanBase64 = (base64: string) => {
  return base64.split(',')[1];
};

export const analyzeFlowerImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash-image";
  const cleanData = cleanBase64(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity or read from header
              data: cleanData
            }
          },
          {
            text: `Analyze this image of a floral arrangement. 
            Act as a high-end florist copywriter.
            Provide a JSON response with the following structure:
            - name: A creative, elegant name for the bouquet.
            - description: A sophisticated 2-sentence description suitable for a luxury e-commerce site.
            - price: An estimated price in USD (number only) based on complexity and flower types.
            - category: One of [Romance, Sympathy, Celebration, Seasonal, Everyday].
            - tags: Array of 3-5 strings identifying the main flowers or colors.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "description", "price", "category", "tags"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};

export const generateMarketingCopy = async (productName: string, tags: string[]): Promise<string> => {
  if (!apiKey) return "Beautiful arrangement.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, poetic marketing blurb (max 20 words) for a flower bouquet named "${productName}" containing these elements: ${tags.join(', ')}.`,
    });
    return response.text || "";
  } catch (e) {
    console.error(e);
    return "";
  }
};