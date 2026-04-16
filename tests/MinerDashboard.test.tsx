import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MinerDashboard } from '../components/MinerDashboard';
import { intelligenceGateway } from '../services/intelligence/IntelligenceGateway';

vi.mock('../services/intelligence/IntelligenceGateway', () => ({
  intelligenceGateway: {
    analyzeCodeBlock: vi.fn(),
    scoutPatterns: vi.fn(),
    getAvailableProviders: vi.fn(() => ['GEMINI_3_FLASH'])
  }
}));

describe('MinerDashboard', () => {
  const onPatternsFound = vi.fn();
  const onSwitchToCatalog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays an error when manual mining fails', async () => {
    const mockError = new Error('Manual extraction failed');
    (intelligenceGateway.analyzeCodeBlock as any).mockRejectedValueOnce(mockError);

    render(<MinerDashboard onPatternsFound={onPatternsFound} onSwitchToCatalog={onSwitchToCatalog} />);

    // The default mode is MANUAL. We can just click INITIATE MINING.
    fireEvent.click(screen.getByText('INITIATE MINING'));

    await waitFor(() => {
      expect(screen.getByText('Mining Protocol Failed: Manual extraction failed')).toBeInTheDocument();
    });

    // Check log
    expect(screen.getByText((content) => content.includes('CRITICAL FAILURE in mining sequence'))).toBeInTheDocument();
  });

  it('displays an error when scout mining fails', async () => {
    const mockError = new Error('Scout protocol offline');
    (intelligenceGateway.scoutPatterns as any).mockRejectedValueOnce(mockError);

    render(<MinerDashboard onPatternsFound={onPatternsFound} onSwitchToCatalog={onSwitchToCatalog} />);

    // Switch to SCOUT mode
    fireEvent.click(screen.getByText('NEURAL SCOUT'));

    // Add search query to enable the button effectively
    const input = screen.getByPlaceholderText('e.g. "React Authentication Hook with JWT"');
    fireEvent.change(input, { target: { value: 'test pattern' } });

    // Click DEPLOY SCOUT button
    fireEvent.click(screen.getByText('DEPLOY SCOUT'));

    await waitFor(() => {
      expect(screen.getByText('Mining Protocol Failed: Scout protocol offline')).toBeInTheDocument();
    });
  });
});
