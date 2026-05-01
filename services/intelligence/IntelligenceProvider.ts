import { CodePattern } from "../../types";

/**
 * Interface defining the contract for all intelligence providers.
 * Enforces the Anti-Corruption Layer (ACL) between external AI services
 * and the core domain logic.
 */
export interface IntelligenceProvider {
  /**
   * Identifies the provider (e.g., "GEMINI_3_FLASH", "CLAUDE_3_5_SONNET").
   */
  readonly name: string;

  /**
   * Analyzes a raw code block to extract distinct, reusable patterns.
   *
   * @param {string} code - The raw source code to analyze.
   * @returns {Promise<CodePattern[]>} Normalized code patterns.
   * @throws {Error} If analysis fails or normalization cannot be achieved.
   */
  analyzeCodeBlock(code: string): Promise<CodePattern[]>;

  /**
   * Acts as a Neural Scout to synthesize or retrieve production-ready
   * code patterns related to a specific topic.
   *
   * @param {string} topic - The domain or subject to scout patterns for.
   * @returns {Promise<CodePattern[]>} Normalized code patterns.
   * @throws {Error} If scouting fails or normalization cannot be achieved.
   */
  scoutPatterns(topic: string): Promise<CodePattern[]>;

  /**
   * Generates semantic search tags based on a provided coding query.
   *
   * @param {string} query - The search string or coding problem.
   * @returns {Promise<string[]>} An array of semantic tags.
   */
  generateSearchQuery(query: string): Promise<string[]>;

  /**
   * Refactors a code pattern to reduce complexity and improve stability.
   *
   * @param {CodePattern} pattern - The pattern to refactor.
   * @returns {Promise<CodePattern>} The refactored code pattern.
   * @throws {Error} If refactoring fails.
   */
  refactorPattern(pattern: CodePattern): Promise<CodePattern>;

}
