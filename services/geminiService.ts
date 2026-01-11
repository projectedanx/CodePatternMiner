import { GoogleGenAI, Type } from "@google/genai";
import { CodePattern, PatternType } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client securely
const getClient = () => {
  if (!API_KEY) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const PATTERN_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["FUNCTION", "CLASS", "HOOK", "UTILITY", "COMPONENT"] },
      description: { type: Type.STRING },
      code: { type: Type.STRING },
      complexity: { type: Type.NUMBER },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence: { type: Type.NUMBER },
      sovereignRating: { type: Type.STRING },
      usageDocs: { type: Type.STRING },
      ast: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          children: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              description: "Recursive AST Node",
              properties: {
                 name: { type: Type.STRING },
                 type: { type: Type.STRING },
                 value: { type: Type.STRING }
              }
            }
          }
        },
        required: ["name", "type"]
      }
    },
    required: ["name", "type", "description", "code", "complexity", "ast"]
  }
};

export const analyzeCodeBlock = async (code: string): Promise<CodePattern[]> => {
  const ai = getClient();
  
  const prompt = `
    Analyze the following code block as a Static Analysis Engine enhanced with Semantic Understanding. 
    Identify distinct reusable patterns (functions, classes, hooks, components).
    
    For each pattern found:
    1. Extract the raw code.
    2. Determine its type (FUNCTION, CLASS, HOOK, UTILITY, COMPONENT).
    3. Calculate a complexity score (1-10) based on cyclomatic complexity logic.
    4. Generate a simplified AST (Abstract Syntax Tree) representation suitable for D3 visualization (root node with children).
    5. Provide a sovereign rating (STABLE, VOLATILE, CRITICAL) based on code quality and safety.
    6. Write a brief usage documentation string.

    Code to analyze:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PATTERN_SCHEMA
      }
    });

    if (response.text) {
      const rawPatterns = JSON.parse(response.text);
      // Enrich with client-side IDs
      return rawPatterns.map((p: any) => ({
        ...p,
        id: crypto.randomUUID(),
        type: p.type as PatternType,
        origin: 'USER_INPUT'
      }));
    }
    return [];
  } catch (error) {
    console.error("Analysis Protocol Failed:", error);
    throw error;
  }
};

export const scoutPatterns = async (topic: string): Promise<CodePattern[]> => {
  const ai = getClient();
  
  const prompt = `
    ACT AS A CODE ARCHAEOLOGIST.
    TOPIC: "${topic}"
    
    TASK:
    Retrieve/Synthesize 3 distinct, high-quality, production-ready code patterns related to the TOPIC.
    These should be patterns one might find in a top-tier open source repository (e.g. React, Lodash, Linux Kernel - adapted to TS/JS).
    
    For each pattern:
    1. Write the implementation code.
    2. Create the AST.
    3. Rate it.
    4. Ensure diversity in the examples (e.g. one simple, one complex, one edge-case).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PATTERN_SCHEMA
      }
    });

    if (response.text) {
      const rawPatterns = JSON.parse(response.text);
      return rawPatterns.map((p: any) => ({
        ...p,
        id: crypto.randomUUID(),
        type: p.type as PatternType,
        origin: 'NEURAL_MINE'
      }));
    }
    return [];
  } catch (error) {
    console.error("Scout Protocol Failed:", error);
    throw error;
  }
};

export const generateSearchQuery = async (query: string): Promise<string[]> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5 semantic search tags for the coding query: "${query}". Return only a JSON array of strings.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    return response.text ? JSON.parse(response.text) : [];
}
