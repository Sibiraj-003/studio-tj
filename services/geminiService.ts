import { GoogleGenAI, Type } from "@google/genai";
import { AiConceptResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePhotoConcept = async (userIdea: string): Promise<AiConceptResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a professional photoshoot concept based on this user idea: "${userIdea}". Return a JSON object with a catchy title, a mood description, suggested wardrobe (array of strings), a shot list (array of strings), and lighting recommendations.`,
      config: {
        systemInstruction: "You are a world-class creative director for a high-end photography studio. Your tone is artistic, visionary, and practical.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            mood: { type: Type.STRING },
            wardrobe: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            shotList: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            lighting: { type: Type.STRING }
          },
          required: ["title", "mood", "wardrobe", "shotList", "lighting"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AiConceptResult;
  } catch (error) {
    console.error("Error generating concept:", error);
    return null;
  }
};