import { CodePattern, EpistemicEscrow } from "../../types";
import { intelligenceGateway } from "./IntelligenceGateway";
import { CipherEmergenceEngine, SymbolicScar } from "./cipherEmergence";

/**
 * Sovereign Fixer Agent (Phase 4 Roadmap Fulfillment)
 * Reduces cyclomatic complexity and improves stability of CRITICAL or VOLATILE patterns,
 * placing them in Epistemic Escrow for human paraconsistent tension adjudication.
 */
export class FixerAgent {
  /**
   * Proposes a refactored version of the pattern and wraps it in Epistemic Escrow.
   * @param pattern - The code pattern to be refactored.
   * @param providerName - The AI provider to use.
   * @returns A mutated CodePattern containing the proposed refactor in escrow.
   */
  public async proposeFix(pattern: CodePattern, providerName?: string): Promise<CodePattern> {
    if (pattern.sovereignRating === 'STABLE') {
      console.warn("Attempting to fix a STABLE pattern. Proceeding, but verify intent.");
    }

    try {
      // Prompt the provider to refactor
      const refactoredPattern = await intelligenceGateway.refactorPattern(pattern, providerName);

      const tensionMetric = Math.abs(pattern.complexity - refactoredPattern.complexity) * 0.1;

      // Calculate infomorphism state to enforce Golden Scar vs Generative Freedom tension
      const mockScar: SymbolicScar = {
        scarId: pattern.id || 'TEMP_SCAR',
        vulnerabilityClass: 'COMPLEXITY',
        astTopologyFingerprint: '0x00'
      };
      const normalizedTension = tensionMetric > 1 ? 1 : tensionMetric;
      const infomorphism = CipherEmergenceEngine.calculateInfomorphism(mockScar, normalizedTension);

      // Wrap the proposal in Epistemic Escrow
      const escrow: EpistemicEscrow = {
        proposedCode: refactoredPattern.code,
        proposedComplexity: refactoredPattern.complexity,
        tensionMetric: normalizedTension, // Normalize 0-1
        infomorphismState: infomorphism,
        status: 'PENDING'
      };

      return {
        ...pattern,
        epistemicEscrow: escrow
      };
    } catch (error) {
      console.error("FixerAgent failed to propose fix:", error);
      throw error;
    }
  }
}

export const fixerAgent = new FixerAgent();
