import React, { useState, useRef } from 'react';

const exampleTopologies = [
  {
    _id: 'star',
    name: 'Star Topology',
    description: 'One central node connected to all others.',
    nodes: [
      { id: 'center', label: 'Central Node', parameters: {} },
      { id: 'a', label: 'Node A', parameters: {} },
      { id: 'b', label: 'Node B', parameters: {} },
      { id: 'c', label: 'Node C', parameters: {} },
      { id: 'd', label: 'Node D', parameters: {} },
    ],
    links: [
      { source: 'center', target: 'a' },
      { source: 'center', target: 'b' },
      { source: 'center', target: 'c' },
      { source: 'center', target: 'd' },
    ],
  },
  {
    _id: 'ring',
    name: 'Ring Topology',
    description: 'Each node connected in a closed loop.',
    nodes: [
      { id: '1', label: 'Node 1', parameters: {} },
      { id: '2', label: 'Node 2', parameters: {} },
      { id: '3', label: 'Node 3', parameters: {} },
      { id: '4', label: 'Node 4', parameters: {} },
    ],
    links: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '1' },
    ],
  },
  {
    _id: 'mesh',
    name: 'Mesh Topology',
    description: 'Every node connected to every other node.',
    nodes: [
      { id: 'x', label: 'Node X', parameters: {} },
      { id: 'y', label: 'Node Y', parameters: {} },
      { id: 'z', label: 'Node Z', parameters: {} },
    ],
    links: [
      { source: 'x', target: 'y' },
      { source: 'x', target: 'z' },
      { source: 'y', target: 'x' },
      { source: 'y', target: 'z' },
      { source: 'z', target: 'x' },
      { source: 'z', target: 'y' },
    ],
  },
];

// Helper to assign x/y positions in a circle
function assignNodePositions(nodes, centerX = 400, centerY = 300, radius = 200) {
  const angleStep = (2 * Math.PI) / nodes.length;
  return nodes.map((node, i) => ({
    ...node,
    x: centerX + radius * Math.cos(i * angleStep),
    y: centerY + radius * Math.sin(i * angleStep),
  }));
}

// Helper to convert link source/target from IDs to node objects
function linkNodesById(links, nodes) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  return links.map(link => ({
    ...link,
    source: nodeMap[link.source],
    target: nodeMap[link.target],
  }));
}

// Helper to pick emoji for node
function getNodeEmoji(node) {
  if (node.radio === 'mmWave') return '📡';
  if (node.radio === 'sub-6GHz') return '📶';
  if (node.radio === 'ultra-mmWave') return '🛰️';
  if (node.label && node.label.toLowerCase().includes('user')) return '📱';
  if (node.label && node.label.toLowerCase().includes('iot')) return '🔗';
  return '🖧';
}

const NODE_RADIUS = 22;

const TopologyBuilder = ({ onTopologyCreated }) => {
  const [mode, setMode] = useState('examples'); // 'examples' or 'custom'
  // Custom topology state
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [linkStartNodeId, setLinkStartNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const svgRef = useRef();

  // Handle adding node
  const handleCanvasClick = (e) => {
    if (mode !== 'custom') return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (nodes.some(n => Math.hypot(n.x - x, n.y - y) < NODE_RADIUS * 2)) return;
    const id = `n${Date.now()}${Math.floor(Math.random()*1000)}`;
    setNodes([...nodes, { id, label: `Node ${nodes.length + 1}`, x, y, parameters: {} }]);
  };

  // Node drag
  const handleNodeMouseDown = (id, e) => {
    setDraggedNodeId(id);
    e.stopPropagation();
  };
  const handleMouseMove = (e) => {
    if (!draggedNodeId) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodes(nodes => nodes.map(n => n.id === draggedNodeId ? { ...n, x, y } : n));
  };
  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Link creation
  const handleNodeClick = (id, e) => {
    e.stopPropagation();
    if (linkStartNodeId && linkStartNodeId !== id) {
      if (!links.some(l => (l.source === linkStartNodeId && l.target === id) || (l.source === id && l.target === linkStartNodeId))) {
        setLinks([...links, { source: linkStartNodeId, target: id }]);
      }
      setLinkStartNodeId(null);
    } else {
      setLinkStartNodeId(id);
    }
  };

  // Node delete
  const handleDeleteNode = (id) => {
    setNodes(nodes => nodes.filter(n => n.id !== id));
    setLinks(links => links.filter(l => l.source !== id && l.target !== id));
  };

  // Link delete
  const handleDeleteLink = (idx) => {
    setLinks(links => links.filter((_, i) => i !== idx));
  };

  // Node rename
  const handleNodeLabelChange = (id, value) => {
    setNodes(nodes => nodes.map(n => n.id === id ? { ...n, label: value } : n));
  };

  // Save custom topology
  const handleSaveCustom = () => {
    if (nodes.length < 2) return alert('Add at least 2 nodes.');
    if (links.length < 1) return alert('Connect at least 2 nodes.');
    if (!customName.trim()) return alert('Please enter a topology name.');
    const linksWithNodes = linkNodesById(links, nodes);
    const nodesCopy = nodes.map(n => ({ ...n }));
    const topology = {
      _id: `custom-${Date.now()}`,
      name: customName,
      description: customDesc,
      nodes: nodesCopy,
      links: linksWithNodes
    };
    if (onTopologyCreated) onTopologyCreated(topology);
    setNodes([]);
    setLinks([]);
    setCustomName('');
    setCustomDesc('');
    setMode('examples');
  };

  // Reset custom builder
  const handleClear = () => {
    setNodes([]);
    setLinks([]);
    setCustomName('');
    setCustomDesc('');
  };

  return (
    <div>
      <h2>Example Topologies</h2>
      <ul>
        {exampleTopologies.map((topo) => (
          <li key={topo._id} style={{ marginBottom: '1em' }}>
            <strong>{topo.name}</strong>: {topo.description}
            <br />
            <button
              className="use-topology-btn"
              onClick={() => handleSelect(topo)}>
              Use this topology
            </button>
          </li>
        ))}
      </ul>
      <button className="use-topology-btn" style={{marginTop: 24, marginBottom: 16}} onClick={() => setMode('custom')}>
        Design Custom Topology
      </button>
      {mode === 'custom' && (
        <div style={{marginTop: 24, marginBottom: 24, textAlign: 'center'}}>
          <h3>Custom Topology Builder</h3>
          <div style={{marginBottom: 16, display: 'flex', justifyContent: 'center', gap: 16}}>
            <input
              type="text"
              placeholder="Topology Name"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              style={{padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #b3bfff', fontSize: 16, minWidth: 180}}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              style={{padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #b3bfff', fontSize: 16, minWidth: 220}}
            />
          </div>
          <svg
            ref={svgRef}
            width={700}
            height={400}
            style={{border: '2px dashed #b3bfff', borderRadius: 16, background: 'rgba(240,245,255,0.7)', cursor: 'crosshair'}}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Draw links */}
            {links.map((l, i) => {
              const source = nodes.find(n => n.id === l.source);
              const target = nodes.find(n => n.id === l.target);
              if (!source || !target) return null;
              return (
                <g key={i} style={{cursor: 'pointer'}}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#5c6bc0"
                    strokeWidth={3}
                    opacity={0.7}
                    onClick={e => { e.stopPropagation(); handleDeleteLink(i); }}
                  />
                  {/* Delete icon for link */}
                  <circle
                    cx={(source.x + target.x) / 2}
                    cy={(source.y + target.y) / 2}
                    r={10}
                    fill="#e53935"
                    opacity={0.7}
                    onClick={e => { e.stopPropagation(); handleDeleteLink(i); }}
                  />
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fill="#fff"
                    style={{pointerEvents: 'none', fontWeight: 700}}
                  >×</text>
                </g>
              );
            })}
            {/* Draw nodes */}
            {nodes.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_RADIUS}
                  fill={linkStartNodeId === n.id ? '#b3bfff' : '#1a237e'}
                  stroke="#fff"
                  strokeWidth={3}
                  onMouseDown={e => handleNodeMouseDown(n.id, e)}
                  onClick={e => handleNodeClick(n.id, e)}
                  style={{cursor: 'pointer'}}
                />
                {/* Emoji icon */}
                <text
                  x={n.x}
                  y={n.y - 6}
                  textAnchor="middle"
                  fontSize={22}
                  style={{pointerEvents: 'none'}}
                >
                  {getNodeEmoji(n)}
                </text>
                {/* Node label or input for renaming */}
                {editingNodeId === n.id ? (
                  <foreignObject x={n.x - 40} y={n.y - 16} width={80} height={32}>
                    <input
                      type="text"
                      value={n.label}
                      autoFocus
                      onChange={e => handleNodeLabelChange(n.id, e.target.value)}
                      onBlur={() => setEditingNodeId(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setEditingNodeId(null); }}
                      style={{width: '100%', fontSize: 14, borderRadius: 6, border: '1px solid #b3bfff', padding: '2px 6px'}}
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={n.x}
                    y={n.y + 18}
                    textAnchor="middle"
                    fontSize={15}
                    fill="#fff"
                    style={{pointerEvents: 'none', fontWeight: 600}}
                    onDoubleClick={() => setEditingNodeId(n.id)}
                  >
                    {n.label}
                  </text>
                )}
                {/* Delete node button */}
                <circle
                  cx={n.x + NODE_RADIUS + 8}
                  cy={n.y - NODE_RADIUS - 8}
                  r={10}
                  fill="#e53935"
                  opacity={0.8}
                  style={{cursor: 'pointer'}}
                  onClick={e => { e.stopPropagation(); handleDeleteNode(n.id); }}
                />
                <text
                  x={n.x + NODE_RADIUS + 8}
                  y={n.y - NODE_RADIUS - 4}
                  textAnchor="middle"
                  fontSize={13}
                  fill="#fff"
                  style={{pointerEvents: 'none', fontWeight: 700}}
                >×</text>
              </g>
            ))}
          </svg>
          <div style={{marginTop: 16}}>
            <button className="use-topology-btn" onClick={handleSaveCustom}>
              Save Custom Topology
            </button>
            <button className="use-topology-btn" style={{marginLeft: 16, background: '#e53935', color: '#fff'}} onClick={handleClear}>
              Clear
            </button>
            <button className="use-topology-btn" style={{marginLeft: 16}} onClick={() => setMode('examples')}>
              Back to Examples
            </button>
          </div>
          <div style={{marginTop: 8, color: '#888', fontSize: 14}}>
            Click to add nodes. Drag nodes to move. Click two nodes to connect.<br/>
            Double-click node label to rename. Click × to delete node or link.
          </div>
        </div>
      )}
    </div>
  );

  function handleSelect(topo) {
    const nodesWithPos = assignNodePositions(topo.nodes);
    const linksWithNodes = linkNodesById(topo.links, nodesWithPos);
    const topologyWithCoords = {
      ...topo,
      nodes: nodesWithPos,
      links: linksWithNodes,
    };
    if (onTopologyCreated) onTopologyCreated(topologyWithCoords);
  }
};

export default TopologyBuilder; 