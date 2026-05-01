import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCard, PatternLinkRenderer } from '../components/PatternCard';
import { PatternType, CodePattern } from '../types';
import React from 'react';

const mockPattern: CodePattern = {
  id: 'pattern-1',
  name: 'SingletonPattern',
  type: PatternType.CLASS,
  description: 'Ensures a class has only one instance, and provides a global point of access to it.',
  code: 'class Singleton { static instance; constructor() { if (Singleton.instance) return Singleton.instance; Singleton.instance = this; } }',
  complexity: 3,
  tags: ['design-pattern', 'creational'],
  astStorageUri: "phantom://ast-blob/dummy", astSummary: { nodeCount: 1, maxDepth: 1 },
  confidence: 0.9,
  sovereignRating: 'STABLE',
  usageDocs: 'Use when exactly one object is needed to coordinate actions across the system.',
  origin: 'NEURAL_MINE'
};

describe('PatternCard Component', () => {
  it('renders the pattern name correctly', () => {
    const handleClick = vi.fn();
    render(<PatternCard pattern={mockPattern} onClick={handleClick} />);

    expect(screen.getByText('SingletonPattern')).toBeInTheDocument();
  });

  it('renders the pattern description correctly', () => {
    const handleClick = vi.fn();
    render(<PatternCard pattern={mockPattern} onClick={handleClick} />);

    expect(screen.getByText(/Ensures a class has only one instance/i)).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    const handleClick = vi.fn();
    render(<PatternCard pattern={mockPattern} onClick={handleClick} />);

    expect(screen.getByText('design-pattern')).toBeInTheDocument();
    expect(screen.getByText('creational')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', () => {
    const handleClick = vi.fn();
    render(<PatternCard pattern={mockPattern} onClick={handleClick} />);

    const cardElement = screen.getByText('SingletonPattern').closest('div')?.parentElement;
    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockPattern);
  });

  it('renders the Golden Scar indicator when present', () => {
    const handleClick = vi.fn();
    const patternWithScar = {
      ...mockPattern,
      goldenScar: {
        adjudicator: 'root',
        rationale: 'AI failed to account for edge case X.',
        tensionWeight: 1.618,
        timestamp: '2026-04-11T18:00:00Z'
      }
    };
    render(<PatternCard pattern={patternWithScar} onClick={handleClick} />);

    expect(screen.getByText('GOLDEN SCAR')).toBeInTheDocument();
    expect(screen.getByText(/Human Adjudication/i)).toBeInTheDocument();
  });
});

describe('PatternLinkRenderer Component', () => {
  it('renders normal text without links if no known names match', () => {
    render(<PatternLinkRenderer text="This uses a UserAuth token." names={['DatabaseConnection']} />);
    expect(screen.getByText('This uses a UserAuth token.')).toBeInTheDocument();
  });

  it('renders clickable links for known pattern names', () => {
    const handleLinkClick = vi.fn();
    render(
      <PatternLinkRenderer
        text="This uses a UserAuth token and a DatabaseConnection."
        names={['UserAuth', 'DatabaseConnection']}
        onLinkClick={handleLinkClick}
      />
    );

    const userAuthLink = screen.getByText('UserAuth');
    const dbConnLink = screen.getByText('DatabaseConnection');

    expect(userAuthLink).toBeInTheDocument();
    expect(userAuthLink.tagName.toLowerCase()).toBe('span');
    expect(dbConnLink).toBeInTheDocument();

    fireEvent.click(userAuthLink);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(handleLinkClick).toHaveBeenCalledWith('UserAuth');
  });

  it('does not crash if onLinkClick is not provided', () => {
    render(
      <PatternLinkRenderer
        text="This uses a UserAuth token."
        names={['UserAuth']}
      />
    );
    expect(screen.getByText('This uses a UserAuth token.')).toBeInTheDocument();
  });
});
