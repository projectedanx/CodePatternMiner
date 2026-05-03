import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatternDetailPanel } from '../components/PatternDetailPanel';
import { CodePattern, PatternType } from '../types';
import { fixerAgent } from '../services/intelligence/FixerAgent';
import { fetchASTFromPhantomStorage } from '../services/phantomStorage';

vi.mock('../services/phantomStorage', () => ({
  fetchASTFromPhantomStorage: vi.fn().mockResolvedValue({ name: 'root', type: 'Program', children: [] })
}));

import { ASTVisualizer } from '../components/ASTVisualizer';

vi.mock('../components/ASTVisualizer', () => ({
  ASTVisualizer: () => <div data-testid="mock-ast-visualizer" />
}));



vi.mock('../services/intelligence/FixerAgent', () => ({
  fixerAgent: {
    proposeFix: vi.fn(),
  },
}));

const mockPattern: CodePattern = {
  id: 'test-1',
  name: 'ComplexAuthHook',
  type: PatternType.HOOK,
  description: 'A very complex hook',
  code: 'function useAuth() { /* complex logic */ }',
  complexity: 9,
  tags: ['auth'],
  astStorageUri: 'gs://test',
  astSummary: { nodeCount: 50, maxDepth: 10 },
  confidence: 0.6,
  sovereignRating: 'CRITICAL',
  usageDocs: 'Use carefully',
  origin: 'NEURAL_MINE'
};

const mockEscrowPattern: CodePattern = {
  ...mockPattern,
  epistemicEscrow: {
    proposedCode: 'function useAuth() { /* simplified logic */ }',
    proposedComplexity: 4,
    tensionMetric: 0.5,
    status: 'PENDING'
  }
};

describe('PatternDetailPanel - Epistemic Escrow', () => {
  it('renders TRIGGER SOVEREIGN FIXER button for CRITICAL patterns', () => {
    render(
      <PatternDetailPanel
        selected={mockPattern}
        allPatternNames={[]}
        onClose={() => {}}
        onLinkClick={() => {}}
        onUpdatePattern={() => {}}
      />
    );
    expect(screen.getByText('TRIGGER SOVEREIGN FIXER')).toBeInTheDocument();
  });

  it('does not render TRIGGER SOVEREIGN FIXER button for STABLE patterns', () => {
    render(
      <PatternDetailPanel
        selected={{ ...mockPattern, sovereignRating: 'STABLE' }}
        allPatternNames={[]}
        onClose={() => {}}
        onLinkClick={() => {}}
        onUpdatePattern={() => {}}
      />
    );
    expect(screen.queryByText('TRIGGER SOVEREIGN FIXER')).not.toBeInTheDocument();
  });

  it('renders Superposition View when epistemicEscrow is present', () => {
    render(
      <PatternDetailPanel
        selected={mockEscrowPattern}
        allPatternNames={[]}
        onClose={() => {}}
        onLinkClick={() => {}}
        onUpdatePattern={() => {}}
      />
    );

    expect(screen.getByText('EPISTEMIC ESCROW: PARACONSISTENT TENSION')).toBeInTheDocument();
    expect(screen.getByText('function useAuth() { /* simplified logic */ }')).toBeInTheDocument();
    expect(screen.getAllByText('function useAuth() { /* complex logic */ }')[0]).toBeInTheDocument();
  });

  it('triggers proposeFix and updates pattern when button is clicked', async () => {
    const onUpdatePattern = vi.fn();
    (fixerAgent.proposeFix as any).mockResolvedValue(mockEscrowPattern);

    render(
      <PatternDetailPanel
        selected={mockPattern}
        allPatternNames={[]}
        onClose={() => {}}
        onLinkClick={() => {}}
        onUpdatePattern={onUpdatePattern}
      />
    );

    fireEvent.click(screen.getByText('TRIGGER SOVEREIGN FIXER'));

    await waitFor(() => {
      expect(fixerAgent.proposeFix).toHaveBeenCalledWith(mockPattern);
      expect(onUpdatePattern).toHaveBeenCalledWith(mockEscrowPattern);
    });
  });

  it('allows human adjudication via Golden Scar Protocol to resolve escrow', async () => {
    const onUpdatePattern = vi.fn();

    render(
      <PatternDetailPanel
        selected={mockEscrowPattern}
        allPatternNames={[]}
        onClose={() => {}}
        onLinkClick={() => {}}
        onUpdatePattern={onUpdatePattern}
      />
    );

    // Verify resolving UI
    const rationaleInput = screen.getByPlaceholderText('Enter empirical rationale for overriding AI...');
    fireEvent.change(rationaleInput, { target: { value: 'Preserving edge case logic' } });

    fireEvent.click(screen.getByText('RESOLVE (HUMAN DOMINANT Φ=1.618)'));

    expect(onUpdatePattern).toHaveBeenCalled();
    const updatedPattern = onUpdatePattern.mock.calls[0][0];

    expect(updatedPattern.epistemicEscrow.status).toBe('RESOLVED_REJECTED');
    expect(updatedPattern.goldenScar.rationale).toBe('Preserving edge case logic');
    expect(updatedPattern.goldenScar.tensionWeight).toBe(1.618);
  });
});
