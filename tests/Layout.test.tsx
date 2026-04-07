import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Layout } from '../components/Layout';

const mockNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <span>D</span> },
  { id: 'patterns', label: 'Patterns', icon: <span>P</span> },
  { id: 'settings', label: 'Settings', icon: <span>S</span> },
];

const mockStats = {
  patternCount: 42,
};

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout
        currentView="dashboard"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        stats={mockStats}
      >
        <div data-testid="child-content">Main Content Area</div>
      </Layout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Main Content Area')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(
      <Layout
        currentView="dashboard"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        stats={mockStats}
      >
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays the correct pattern count stat', () => {
    render(
      <Layout
        currentView="dashboard"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        stats={mockStats}
      >
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('calls onNavigate with correct id when a navigation item is clicked', () => {
    const handleNavigate = vi.fn();
    render(
      <Layout
        currentView="dashboard"
        onNavigate={handleNavigate}
        navItems={mockNavItems}
        stats={mockStats}
      >
        <div>Content</div>
      </Layout>
    );

    const patternsButton = screen.getByText('Patterns').closest('button');
    fireEvent.click(patternsButton!);

    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith('patterns');
  });

  it('highlights the current view correctly', () => {
    render(
      <Layout
        currentView="patterns"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        stats={mockStats}
      >
        <div>Content</div>
      </Layout>
    );

    const patternsButton = screen.getByText('Patterns').closest('button');
    expect(patternsButton).toHaveClass('bg-primary/5');

    const dashboardButton = screen.getByText('Dashboard').closest('button');
    expect(dashboardButton).not.toHaveClass('bg-primary/5');
  });
});
