import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ASTVisualizer } from '../src/components/ASTVisualizer';
import { ASTNode } from '../src/types';
import * as d3 from 'd3';

// JSDOM SVG element doesn't have createSVGPoint, getScreenCTM, viewBox, width, height implementations that d3-zoom needs
vi.mock('d3', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    zoom: () => {
      const zoomFn = (selection: any) => {};
      zoomFn.scaleExtent = () => zoomFn;
      zoomFn.on = () => zoomFn;
      zoomFn.transform = () => zoomFn;
      return zoomFn;
    },
    zoomTransform: (node: any) => ({
      apply: (point: [number, number]) => [point[0], point[1]],
      k: 1, x: 0, y: 0
    }),
  };
});

const mockData: ASTNode = {
  name: 'Program',
  type: 'Root',
  children: [
    {
      name: 'foo',
      type: 'FunctionDeclaration',
      children: [
        { name: 'x', type: 'Identifier' },
        { name: 'BlockStatement', type: 'BlockStatement' }
      ]
    },
    {
      name: 'bar',
      type: 'VariableDeclaration'
    }
  ]
};

describe('ASTVisualizer Component', () => {
  beforeAll(() => {
    // Add methods to SVGSVGElement prototype for D3 layout/zoom logic to pass gracefully
    if (!SVGSVGElement.prototype.createSVGPoint) {
      SVGSVGElement.prototype.createSVGPoint = () => ({
        x: 0,
        y: 0,
        matrixTransform: vi.fn().mockReturnThis(),
      } as any);
    }
    if (!SVGSVGElement.prototype.getScreenCTM) {
      SVGSVGElement.prototype.getScreenCTM = () => ({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        inverse: vi.fn().mockReturnThis()
      } as any);
    }
  });

  it('renders without crashing', () => {
    const { container } = render(<ASTVisualizer data={mockData} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the correct number of nodes', async () => {
    const { container } = render(<ASTVisualizer data={mockData} />);

    // 1 root + 2 children + 2 grandchildren = 5 nodes
    await waitFor(() => {
      const nodes = container.querySelectorAll('.node');
      expect(nodes.length).toBe(5);
    });
  });

  it('renders the correct number of links', async () => {
    const { container } = render(<ASTVisualizer data={mockData} />);

    // 5 nodes in a tree means 4 links
    await waitFor(() => {
      const links = container.querySelectorAll('.link');
      expect(links.length).toBe(4);
    });
  });

  it('shows tooltip on hover and hides on mouse out', async () => {
    const { container, queryByText } = render(<ASTVisualizer data={mockData} />);

    // Wait for D3 to render nodes
    await waitFor(() => {
      expect(container.querySelectorAll('.node circle').length).toBe(5);
    });

    const circles = container.querySelectorAll('.node circle');
    // Hover the first circle (Root)
    fireEvent.mouseOver(circles[0]);

    // Tooltip should contain the type and name
    await waitFor(() => {
      expect(screen.queryAllByText('Root').length).toBeGreaterThan(0);
    });

    // Mouse out
    fireEvent.mouseOut(circles[0]);

    // Tooltip should disappear
    await waitFor(() => {
      // The tooltip creates a specific DIV structure, check for that
      expect(container.querySelector('.backdrop-blur-md')).not.toBeInTheDocument();
    });
  });
});
