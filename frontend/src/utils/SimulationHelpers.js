// Calculate statistics for metrics
export const calculateStats = (data) => {
    if (!data || data.length === 0) return {};
    
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    // Standard deviation
    const squareDiffs = data.map(value => (value - avg) ** 2);
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Percentiles
    const sorted = [...data].sort((a, b) => a - b);
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      avg,
      min,
      max,
      stdDev,
      p90,
      p95
    };
  };
  
  // Convert simulation results to chart data
  export const resultsToChartData = (results) => {
    if (!results) return null;
    
    return {
      latency: calculateStats(results.metrics.latency),
      throughput: calculateStats(results.metrics.throughput),
      bandwidth: calculateStats(results.metrics.bandwidth),
      packetLoss: calculateStats(results.metrics.packetLoss)
    };
  };
  
  // Generate topology preview image
  export const generateTopologyPreview = (topology) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Draw nodes
    topology.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x * 0.5, node.y * 0.5, 5, 0, Math.PI * 2);
      ctx.fillStyle = 
        node.type === 'baseStation' ? '#3498db' : 
        node.type === 'iotDevice' ? '#2ecc71' : '#e74c3c';
      ctx.fill();
    });
    
    // Draw links
    topology.links.forEach(link => {
      const source = topology.nodes.find(n => n.id === link.source);
      const target = topology.nodes.find(n => n.id === link.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x * 0.5, source.y * 0.5);
        ctx.lineTo(target.x * 0.5, target.y * 0.5);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = Math.max(1, link.bandwidth / 50);
        ctx.stroke();
      }
    });
    
    return canvas.toDataURL('image/png');
  };