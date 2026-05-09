import { GoogleGenAI, Type } from "@google/genai";
import { CodePattern, PatternType, ASTNode } from "../../../types";
import { saveASTToPhantomStorage, calculateASTSummary } from "../../phantomStorage";
import { IntelligenceProvider } from "../IntelligenceProvider";

const API_KEY = process.env.API_KEY || '';

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

interface RawPattern extends Omit<CodePattern, 'id' | 'origin' | 'type' | 'astStorageUri' | 'astSummary'> {
  type: string;
  ast: ASTNode;
}

const parseAndEnrichPatterns = async (text: string, origin: 'USER_INPUT' | 'NEURAL_MINE'): Promise<CodePattern[]> => {
  const rawPatterns = JSON.parse(text) as RawPattern[];

  const enrichedPatterns = await Promise.all(rawPatterns.map(async (p: RawPattern) => {
    const id = crypto.randomUUID();
    const type = p.type as PatternType;

    const astSummary = calculateASTSummary(p.ast);
    const astStorageUri = await saveASTToPhantomStorage(id, p.ast);

    const { ast, ...patternData } = p;

    return {
      ...patternData,
      id,
      type,
      origin,
      astStorageUri,
      astSummary
    } as CodePattern;
  }));

  return enrichedPatterns;
};

/**
 * A concrete implementation of IntelligenceProvider that utilizes Google's Gemini models.
 * Handles AI-driven code analysis, pattern discovery, and refactoring.
 */
export class GeminiProvider implements IntelligenceProvider {
  public readonly name = "GEMINI_3_FLASH";

  /**
   * Analyzes a given code block to extract metadata, complexity, and topological features.
   *
   * @param {string} code - The raw source code to analyze.
   * @returns {Promise<CodePattern[]>} The extracted metadata mapped to an array of CodePatterns.
   */
  public async analyzeCodeBlock(code: string): Promise<CodePattern[]> {
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
        return parseAndEnrichPatterns(response.text, 'USER_INPUT');
      }
      return [];
    } catch (error) {
      console.error("Gemini Analysis Protocol Failed:", error);
      throw error;
    }
  }

  /**
   * Scans a large codebase or string of code to automatically identify and extract reusable patterns.
   *
   * @param {string} topic - The topic to search patterns for.
   * @returns {Promise<CodePattern[]>} An array of independently identified and enriched patterns.
   */
  public async scoutPatterns(topic: string): Promise<CodePattern[]> {
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
        return parseAndEnrichPatterns(response.text, 'NEURAL_MINE');
      }
      return [];
    } catch (error) {
      console.error("Gemini Scout Protocol Failed:", error);
      throw error;
    }
  }


  /**
   * Proposes a refactored version of the given pattern.
   *
   * @param {CodePattern} pattern - The original pattern to refactor.
   * @returns {Promise<CodePattern>} The refactored pattern.
   */
  public async refactorPattern(pattern: CodePattern): Promise<CodePattern> {
    const ai = getClient();
    const prompt = `
      ACT AS A SOVEREIGN FIXER AGENT.
      You are required to refactor the following \${pattern.sovereignRating} code pattern to reduce its cyclomatic complexity and improve its stability to 'STABLE'.

      CRITICAL INSTRUCTION: You must simplify the logic WHILE ATTEMPTING to preserve any hidden human context or edge cases.
      This contradiction is intentional.

      Current Pattern:
      \${pattern.code}

      Generate a valid JSON object matching the standard PATTERN_SCHEMA with your refactored code and an updated complexity score.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: PATTERN_SCHEMA.items // Use the item schema for a single pattern
        }
      });

      if (response.text) {
         // Return as array, parseAndEnrich expects array
         const enriched = await parseAndEnrichPatterns(`[\${response.text}]`, 'NEURAL_MINE');
         return enriched[0];
      }
      throw new Error("No response from Gemini");
    } catch (error) {
      console.error("Gemini Refactor Protocol Failed:", error);
      throw error;
    }
  }

  /**
   * Converts a user's natural language input into a structured codebase search query.
   *
   * @param {string} query - The natural language intent.
   * @returns {Promise<string[]>} An array of structural query tokens.
   */
  public async generateSearchQuery(query: string): Promise<string[]> {
      const ai = getClient();
      try {
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
      } catch (error) {
        console.error("Gemini Search Query Protocol Failed:", error);
        throw error;
      }
  }
}
