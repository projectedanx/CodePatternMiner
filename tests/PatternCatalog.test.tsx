import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCatalog } from '../src/components/PatternCatalog';
import { PatternType, CodePattern } from '../src/types';

// Mock the child components so we can test just the Catalog's behavior
vi.mock('../src/components/PatternCard', () => ({
  PatternCard: ({ pattern, onClick, onLinkClick }: any) => (
    <div data-testid={`pattern-card-${pattern.id}`} onClick={() => onClick(pattern)}>
      {pattern.name} - {pattern.type} - Confidence: {pattern.confidence}
      <button data-testid={`link-${pattern.id}`} onClick={(e) => { e.stopPropagation(); onLinkClick(pattern.name); }}>Link</button>
    </div>
  )
}));

vi.mock('../src/components/PatternDetailPanel', () => ({
  PatternDetailPanel: ({ selected, onClose, onLinkClick }: any) => (
    selected ? (
      <div data-testid="detail-panel">
        <h2>{selected.name} Details</h2>
        <button data-testid="close-detail" onClick={onClose}>Close</button>
        {/* Simulate a link click from inside the detail panel to an unknown pattern */}
        <button data-testid="link-unknown" onClick={() => onLinkClick('UnknownPattern')}>Link Unknown</button>
      </div>
    ) : null
  )
}));

const mockPatterns: CodePattern[] = [
  {
    id: '1',
    name: 'UserAuth',
    type: PatternType.CLASS,
    description: 'Auth class',
    code: 'class UserAuth {}',
    complexity: 5,
    tags: ['auth'],
    astStorageUri: "phantom://ast-blob/dummy", astSummary: { nodeCount: 1, maxDepth: 1 },
    confidence: 0.9,
    sovereignRating: 'STABLE',
    usageDocs: '',
    origin: 'USER_INPUT'
  },
  {
    id: '2',
    name: 'useFetch',
    type: PatternType.HOOK,
    description: 'Fetch hook',
    code: 'function useFetch() {}',
    complexity: 3,
    tags: ['hook', 'fetch'],
    astStorageUri: "phantom://ast-blob/dummy", astSummary: { nodeCount: 1, maxDepth: 1 },
    confidence: 0.7,
    sovereignRating: 'STABLE',
    usageDocs: '',
    origin: 'NEURAL_MINE'
  },
  {
    id: '3',
    name: 'formatDate',
    type: PatternType.UTILITY,
    description: 'Date formatter',
    code: 'const formatDate = () => {}',
    complexity: 1,
    tags: ['date'],
    astStorageUri: "phantom://ast-blob/dummy", astSummary: { nodeCount: 1, maxDepth: 1 },
    confidence: 0.95,
    sovereignRating: 'STABLE',
    usageDocs: '',
    origin: 'USER_INPUT'
  }
];

describe('PatternCatalog', () => {
  it('renders correctly with empty patterns', () => {
    render(<PatternCatalog patterns={[]} />);
    expect(screen.getByText('COMPONENT CATALOG')).toBeInTheDocument();
    expect(screen.getByText('No patterns found matching criteria.')).toBeInTheDocument();
  });

  it('renders all patterns initially', () => {
    render(<PatternCatalog patterns={mockPatterns} />);
    expect(screen.getByTestId('pattern-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-card-3')).toBeInTheDocument();
  });

  it('filters patterns by PatternType', () => {
    render(<PatternCatalog patterns={mockPatterns} />);

    // Click 'HOOK' filter
    fireEvent.click(screen.getByText('HOOK'));

    expect(screen.queryByTestId('pattern-card-1')).not.toBeInTheDocument(); // CLASS
    expect(screen.getByTestId('pattern-card-2')).toBeInTheDocument(); // HOOK
    expect(screen.queryByTestId('pattern-card-3')).not.toBeInTheDocument(); // UTILITY
  });

  it('filters patterns by minimum confidence', () => {
    render(<PatternCatalog patterns={mockPatterns} />);

    // Change slider to 80
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80' } });

    expect(screen.getByTestId('pattern-card-1')).toBeInTheDocument(); // 0.9 (90%)
    expect(screen.queryByTestId('pattern-card-2')).not.toBeInTheDocument(); // 0.7 (70%)
    expect(screen.getByTestId('pattern-card-3')).toBeInTheDocument(); // 0.95 (95%)
  });

  it('filters patterns by search term and clears search', () => {
    render(<PatternCatalog patterns={mockPatterns} />);

    // Trigger onLinkClick from a pattern card
    fireEvent.click(screen.getByTestId('link-1'));

    // Now it should show the active filter
    expect(screen.getByText('"UserAuth"')).toBeInTheDocument();

    // It should also select the pattern because name matches
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();

    // Now if we change filter to something else to see if other cards are hidden
    expect(screen.getByTestId('pattern-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('pattern-card-2')).not.toBeInTheDocument();

    // Now clear search
    const clearButton = screen.getByText('"UserAuth"').querySelector('button');
    if (clearButton) {
        fireEvent.click(clearButton);
    }

    // Search term cleared, all should be visible
    expect(screen.queryByText('"UserAuth"')).not.toBeInTheDocument();
    expect(screen.getByTestId('pattern-card-2')).toBeInTheDocument();
  });

  it('handles search term clearing from empty state', () => {
    render(<PatternCatalog patterns={mockPatterns} />);

    // Click a pattern card to open detail panel
    fireEvent.click(screen.getByTestId('pattern-card-1'));

    // Trigger link click to an unknown pattern from detail panel
    fireEvent.click(screen.getByTestId('link-unknown'));

    // Now the search term is 'UnknownPattern' and no pattern matches
    expect(screen.getByText('No patterns found matching criteria.')).toBeInTheDocument();

    // Clear Search button should be visible
    const clearSearchLink = screen.getByText('Clear Search');
    expect(clearSearchLink).toBeInTheDocument();

    // Click it
    fireEvent.click(clearSearchLink);

    // Search term is cleared, patterns are visible again
    expect(screen.getByTestId('pattern-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-card-2')).toBeInTheDocument();
  });

  it('selects a pattern and opens detail panel, then closes it', () => {
    render(<PatternCatalog patterns={mockPatterns} />);

    // Click a pattern card
    fireEvent.click(screen.getByTestId('pattern-card-1'));

    // Check if detail panel is open
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    expect(screen.getByText('UserAuth Details')).toBeInTheDocument();

    // Close it
    fireEvent.click(screen.getByTestId('close-detail'));

    // Panel should be gone
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });
});
