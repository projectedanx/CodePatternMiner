import { IntelligenceProvider } from "./IntelligenceProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { CodePattern } from "../../types";

/**
 * Acts as the Anti-Corruption Layer (ACL) and Factory for intelligence providers.
 * Decouples core business logic from specific AI vendor implementations.
 */
export class IntelligenceGateway {
  private providers: Map<string, IntelligenceProvider> = new Map();
  private defaultProvider: string;

  /**
   * Initializes the IntelligenceGateway.
   * It loads providers dynamically and has a fallback to the default Gemini Provider.
   */
  constructor() {
    // Register available providers
    const gemini = new GeminiProvider();
    this.providers.set(gemini.name, gemini);
    this.defaultProvider = gemini.name;
  }

  /**
   * Retrieves a specific provider by name.
   * @param {string} [providerName] - Optional specific provider to use.
   * @returns {IntelligenceProvider} The requested or default provider.
   * @throws {Error} If the requested provider is not registered.
   */
  private getProvider(providerName?: string): IntelligenceProvider {
    const target = providerName || this.defaultProvider;
    const provider = this.providers.get(target);
    if (!provider) {
      throw new Error(`Intelligence Provider '${target}' is not registered.`);
    }
    return provider;
  }

  /**
   * Returns a list of the names of all registered AI providers.
   *
   * @returns {string[]} An array of provider names.
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Analyzes a code block using the specified provider to extract structure and metadata.
   *
   * @param {string} code - The raw code to analyze.
   * @param {string} [providerName] - The optional name of the provider to use.
   * @returns {Promise<CodePattern[]>} The extracted code patterns.
   */
  public async analyzeCodeBlock(code: string, providerName?: string): Promise<CodePattern[]> {
    const provider = this.getProvider(providerName);
    return provider.analyzeCodeBlock(code);
  }

  /**
   * Scouts a codebase for patterns using the specified provider.
   *
   * @param {string} topic - The search topic or codebase content.
   * @param {string} [providerName] - The optional name of the provider to use.
   * @returns {Promise<CodePattern[]>} The identified patterns.
   */
  public async scoutPatterns(topic: string, providerName?: string): Promise<CodePattern[]> {
    const provider = this.getProvider(providerName);
    return provider.scoutPatterns(topic);
  }

  /**
   * Routes semantic tag generation request to the appropriate provider.
   */

  /**
   * Refactors a code pattern using the specified provider.
   *
   * @param {CodePattern} pattern - The pattern to refactor.
   * @param {string} [providerName] - The optional name of the provider to use.
   * @returns {Promise<CodePattern>} The refactored pattern.
   */
  public async refactorPattern(pattern: CodePattern, providerName?: string): Promise<CodePattern> {
    const provider = this.getProvider(providerName);
    return provider.refactorPattern(pattern);
  }

  /**
   * Generates a structural search query to match patterns based on a user intent query.
   *
   * @param {string} query - The natural language query from the user.
   * @param {string} providerName - Optional name of the provider to use. Defaults to Gemini.
   * @returns {Promise<string[]>} A list of query tokens or patterns generated.
   */
  public async generateSearchQuery(query: string, providerName?: string): Promise<string[]> {
    const provider = this.getProvider(providerName);
    return provider.generateSearchQuery(query);
  }
}

// Export a singleton instance for simplified usage across the app
export const intelligenceGateway = new IntelligenceGateway();
