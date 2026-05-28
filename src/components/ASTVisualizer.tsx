import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ASTNode } from '../types';

/**
 * Properties for configuring the AST visualizer component.
 *
 * @property {ASTNode} data - The root node of the Abstract Syntax Tree to visualize.
 * @property {number} [width=600] - The pixel width of the SVG canvas.
 * @property {number} [height=400] - The pixel height of the SVG canvas.
 */
interface ASTVisualizerProps {
  data: ASTNode;
  width?: number;
  height?: number;
}

/**
 * Internal state structure for tracking the currently hovered AST node tooltip.
 *
 * @property {number} x - The absolute X coordinate for the tooltip.
 * @property {number} y - The absolute Y coordinate for the tooltip.
 * @property {ASTNode} data - The underlying AST node data associated with the hovered element.
 */
interface HoverState {
  x: number;
  y: number;
  data: ASTNode;
}

/**
 * Renders an interactive D3.js force-directed tree diagram representing the code's Abstract Syntax Tree (AST).
 * Includes zoom, pan, and hover tooltip capabilities.
 *
 * @param {ASTVisualizerProps} props - The configuration props for the visualizer.
 * @returns {React.ReactElement} The SVG container rendering the interactive D3 visual.
 */
export const ASTVisualizer: React.FC<ASTVisualizerProps> = ({ data, width = 600, height = 400 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<HoverState | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a container group for zooming
    const g = svg.append("g")
       .attr("class", "ast-container");

    // Define Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("start", () => {
        setIsZooming(true);
        setHoveredNode(null); // Hide tooltip on pan/zoom start
        svg.style("cursor", "grabbing");
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
      .on("end", () => {
        setIsZooming(false);
        svg.style("cursor", "grab");
      });

    // Apply Zoom
    svg.call(zoom)
       .style("cursor", "grab")
       .on("dblclick.zoom", null); // Disable double-click zoom

    // Initialize position (centered with margins)
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top);
    svg.call(zoom.transform, initialTransform);

    // Create hierarchy
    const root = d3.hierarchy<ASTNode>(data);
    
    // Create tree layout
    const treeLayout = d3.tree<ASTNode>().size([innerHeight, innerWidth]);
    treeLayout(root);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#3f3f46")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<ASTNode>, d3.HierarchyPointNode<ASTNode>>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Node Circles
    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.data.type === 'Root' ? '#ef4444' : '#06b6d4')
      .attr("stroke", "#09090b")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "fill 0.3s ease, r 0.3s ease") // Only animate specific props to avoid conflict with zoom
      .on("mouseover", function(event, d) {
        if (isZooming) return;

        // Visual Feedback
        d3.select(this)
          .transition().duration(200)
          .attr("r", 9)
          .attr("fill", "#10b981")
          .attr("filter", "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))"); // Neon Bloom
        
        // Calculate transformed coordinates for tooltip
        const transform = d3.zoomTransform(svgRef.current!);
        const [tx, ty] = transform.apply([d.y, d.x]);

        setHoveredNode({
          x: tx,
          y: ty,
          data: d.data
        });
      })
      .on("mouseout", function(event, d) {
        // Reset Visuals
        d3.select(this)
          .transition().duration(200)
          .attr("r", 6)
          .attr("fill", d.data.type === 'Root' ? '#ef4444' : '#06b6d4')
          .attr("filter", null);
        
        setHoveredNode(null);
      });

    // Labels
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("fill", "#a1a1aa")
      .style("font-size", "10px")
      .style("font-family", "JetBrains Mono")
      .style("pointer-events", "none"); // Prevent text from blocking mouseover

  }, [data, width, height]);

  return (
    <div className="relative border border-border-subtle rounded-lg bg-surface-light overflow-hidden group">
      <div className="absolute top-2 left-2 text-xs font-mono text-primary/40 pointer-events-none z-10">
        AST VISUALIZATION // {data.type}
      </div>
      
      {/* Floating HUD Tooltip */}
      {hoveredNode && !isZooming && (
         <div 
            className="absolute z-20 px-3 py-2 bg-surface/95 border border-neon-cyan/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md pointer-events-none transition-all duration-75 ease-out transform -translate-x-1/2 -translate-y-[140%]"
            style={{ left: hoveredNode.x, top: hoveredNode.y }}
         >
           <div className="flex items-center gap-2 mb-1 border-b border-border-subtle pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-neon-cyan uppercase tracking-wider">{hoveredNode.data.type}</span>
           </div>
           <div className="text-xs text-primary font-bold font-sans whitespace-nowrap">{hoveredNode.data.name}</div>
           {hoveredNode.data.value && (
             <div className="text-[10px] text-secondary font-mono mt-1 border-t border-dashed border-border-subtle pt-1">
               val: <span className="text-signal-green">{hoveredNode.data.value}</span>
             </div>
           )}
           {/* Tooltip Arrow */}
           <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-surface/95 border-r border-b border-neon-cyan/30 transform rotate-45 -translate-x-1/2"></div>
         </div>
      )}
      
      <svg ref={svgRef} width={width} height={height} className="block mx-auto" />
    </div>
  );
};
