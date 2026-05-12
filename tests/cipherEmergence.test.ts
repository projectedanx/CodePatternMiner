import { describe, it, expect } from 'vitest';
import { CipherEmergenceEngine, SymbolicScar } from '../services/intelligence/cipherEmergence';
import { ASTSummary } from '../types';

describe('CipherEmergenceEngine - The Emergence Inversion Protocol', () => {

    it('should extrapolate adjacent topologies from a Symbolic Scar without entering a Betti-1 loop', () => {
        const mockScar: SymbolicScar = {
            scarId: 'SCAR-2026-A1B2',
            vulnerabilityClass: 'CWE-89',
            astTopologyFingerprint: 'A1B2C3D4'
        };

        const result = CipherEmergenceEngine.extrapolateTopologies(mockScar);

        // Ensure the engine proposes adjacent topologies based on the base fingerprint
        expect(result.scarId).toBe('SCAR-2026-A1B2');
        expect(result.adjacentTopologies.length).toBeGreaterThan(0);
        expect(result.adjacentTopologies[0]).toContain('PERTURBED_A1B2C3D4');
        expect(result.driftMetrics).toBeDefined();
    });

    it('should inject pluriversal context by querying known STABLE patterns', () => {
        const mockAstSummary: ASTSummary = {
            nodeCount: 50,
            maxDepth: 5
        };

        const result = CipherEmergenceEngine.injectPluriversalContext(mockAstSummary);

        // Ensure the injector retrieves safe stable matches to compare against
        expect(result.queryPattern).toBe('AST_PATTERN_MATCH');
        expect(result.stableMatches.length).toBeGreaterThan(0);
        expect(result.stableMatches).toContain('STABLE_AUTH_FLOW');
    });

    it('should handle empty AST summaries gracefully', () => {
        const emptyAstSummary: ASTSummary = {
            nodeCount: 0,
            maxDepth: 0
        };

        const result = CipherEmergenceEngine.injectPluriversalContext(emptyAstSummary);
        expect(result.stableMatches.length).toBe(0);
    });
});
