// src/components/NetworkVisualizer.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkVisualizer = ({ topology }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (topology && topology.nodes && d3Container.current) {
      const width = 800;
      const height = 600;
      
      // SVG'yi temizle
      d3.select(d3Container.current).selectAll("*").remove();
      
      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
      
      // Düğümleri çiz
      const nodes = svg.selectAll('circle')
        .data(topology.nodes)
        .enter()
        .append('circle')
        .attr('r', 15)
        .attr('fill', '#2c3e50')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      // Bağlantıları çiz
      const links = svg.selectAll('line')
        .data(topology.links)
        .enter()
        .append('line')
        .attr('stroke', '#7f8c8d')
        .attr('stroke-width', 2)
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      // Etiketler
      svg.selectAll('text')
        .data(topology.nodes)
        .enter()
        .append('text')
        .text(d => `Node ${d.id}`)
        .attr('x', d => d.x + 20)
        .attr('y', d => d.y + 5)
        .attr('fill', '#34495e');
    }
  }, [topology]);

  return <div ref={d3Container}></div>;
};

export default NetworkVisualizer;