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
   * Available providers for UI selection.
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Routes code analysis request to the appropriate provider.
   */
  public async analyzeCodeBlock(code: string, providerName?: string): Promise<CodePattern[]> {
    const provider = this.getProvider(providerName);
    return provider.analyzeCodeBlock(code);
  }

  /**
   * Routes scout request to the appropriate provider.
   */
  public async scoutPatterns(topic: string, providerName?: string): Promise<CodePattern[]> {
    const provider = this.getProvider(providerName);
    return provider.scoutPatterns(topic);
  }

  /**
   * Routes semantic tag generation request to the appropriate provider.
   */
  public async generateSearchQuery(query: string, providerName?: string): Promise<string[]> {
    const provider = this.getProvider(providerName);
    return provider.generateSearchQuery(query);
  }
}

// Export a singleton instance for simplified usage across the app
export const intelligenceGateway = new IntelligenceGateway();
