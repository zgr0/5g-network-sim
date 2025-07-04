import React, { useState, useEffect } from 'react';
import TopologyBuilder from './components/TopologyBuilder';
import NetworkVisualizer from './components/NetworkVisualizer';
import SimulationControls from './components/SimulationControls';
import MetricsDashboard from './components/MetricsDashboard';
import DeviceConfigurator from './components/DeviceConfigurator';
import { getTopologies, getResults } from './services/api';
import './App.css';

function App() {
  const [view, setView] = useState('build'); // 'build', 'simulate', 'results'
  const [topologies, setTopologies] = useState([]);
  const [selectedTopology, setSelectedTopology] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [historicalResults, setHistoricalResults] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [simulationProgress, setSimulationProgress] = useState({ running: false, step: 0 });
  const [simulationLiveResult, setSimulationLiveResult] = useState(null);
  const simulationSteps = [
    'Initializing...',
    'Calculating Latency...',
    'Calculating Bandwidth...',
    'Calculating Throughput...',
    'Finalizing...'
  ];

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      const [topos, results] = await Promise.all([
        getTopologies(),
        getResults()
      ]);
      setTopologies(topos);
      setHistoricalResults(results);
    };
    
    fetchData();
  }, []);

  const handleTopologyCreated = (topology) => {
    setTopologies([...topologies, topology]);
    setSelectedTopology(topology);
    setView('simulate');
  };

  const handleRunSimulation = async (resultPromise) => {
    setSimulationProgress({ running: true, step: 0 });
    setSimulationLiveResult(null);
    // Start fetching the result immediately
    const result = await resultPromise;
    setSimulationLiveResult(result);
    // Animate steps
    for (let i = 0; i < simulationSteps.length; i++) {
      setSimulationProgress({ running: true, step: i });
      await new Promise(res => setTimeout(res, i === simulationSteps.length - 1 ? 400 : 900));
    }
    setSimulationResults(result);
    setHistoricalResults([result, ...historicalResults]);
    setSimulationProgress({ running: false, step: 0 });
    setSimulationLiveResult(null);
    setView('results');
  };

  const updateDeviceConfig = (deviceId, config) => {
    setSelectedTopology(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === deviceId ? { ...node, parameters: config } : node
      )
    }));
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`app ${theme}-theme`}>
      <header className="app-header">
        <h1>5G/6G Network Performance Simulator</h1>
        <button onClick={toggleTheme} style={{
          position: 'absolute',
          right: 32,
          top: 32,
          background: theme === 'light' ? '#1a237e' : '#fff',
          color: theme === 'light' ? '#fff' : '#1a237e',
          border: 'none',
          borderRadius: '1.5rem',
          padding: '0.5rem 1.2rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(26,35,126,0.10)',
          zIndex: 10
        }}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <nav>
          <button onClick={() => setView('build')} className={view === 'build' ? 'active' : ''}>
            Topology Builder
          </button>
          <button onClick={() => setView('simulate')} className={view === 'simulate' ? 'active' : ''}>
            Simulation
          </button>
          <button onClick={() => setView('results')} className={view === 'results' ? 'active' : ''}>
            Results
          </button>
        </nav>
      </header>

      <main className="app-content">
        {/* Simulation progress modal */}
        {simulationProgress.running && (
          <div className="simulation-modal-overlay">
            <div className="simulation-modal">
              <h2>Running Simulation</h2>
              <ul className="simulation-steps">
                {simulationSteps.map((step, idx) => (
                  <li key={step} className={simulationProgress.step === idx ? 'active' : simulationProgress.step > idx ? 'done' : ''}>
                    {simulationProgress.step > idx ? '✔️ ' : ''}{step}
                  </li>
                ))}
              </ul>
              {/* Live numerical outputs for each step */}
              <div className="simulation-live-outputs">
                {simulationLiveResult && simulationProgress.step >= 1 && (
                  <div style={{marginBottom: 8}}>
                    <strong>Latency (ms):</strong>
                    <ul style={{margin: '0.3em 0 0 1.2em', padding: 0, fontSize: '1em'}}>
                      {simulationLiveResult.latency.map((l, i) => (
                        <li key={i}>{l.nodeId || l.source} : {l.latency.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {simulationLiveResult && simulationProgress.step >= 2 && (
                  <div style={{marginBottom: 8}}>
                    <strong>Bandwidth (Mbps):</strong>
                    <ul style={{margin: '0.3em 0 0 1.2em', padding: 0, fontSize: '1em'}}>
                      {simulationLiveResult.bandwidth.map((b, i) => (
                        <li key={i}>{(b.source?.id || b.source)} - {(b.target?.id || b.target)} : {b.bandwidth.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {simulationLiveResult && simulationProgress.step >= 3 && (
                  <div style={{marginBottom: 8}}>
                    <strong>Throughput (Mbps):</strong>
                    <ul style={{margin: '0.3em 0 0 1.2em', padding: 0, fontSize: '1em'}}>
                      <li>Average: {simulationLiveResult.throughput.average.toFixed(2)}</li>
                      <li>Max: {simulationLiveResult.throughput.max.toFixed(2)}</li>
                      <li>Min: {simulationLiveResult.throughput.min.toFixed(2)}</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="simulation-spinner"></div>
            </div>
          </div>
        )}
        {view === 'build' && (
          <div className="builder-view">
            <TopologyBuilder onTopologyCreated={handleTopologyCreated} />
          </div>
        )}

        {view === 'simulate' && (
          <div className="simulation-view">
            <div className="visualization-panel">
              {selectedTopology ? (
                <>
                  <h2>{selectedTopology.name}</h2>
                  <NetworkVisualizer 
                    topology={selectedTopology} 
                    onNodeSelect={setSelectedDevice} 
                  />
                  {selectedDevice && (
                    <DeviceConfigurator 
                      device={selectedDevice} 
                      onConfigUpdate={updateDeviceConfig} 
                    />
                  )}
                </>
              ) : (
                <div className="topology-selector">
                  <h2>Select a Topology</h2>
                  <div className="topology-grid">
                    {topologies.map(topology => (
                      <div 
                        key={topology._id} 
                        className="topology-card"
                        onClick={() => setSelectedTopology(topology)}
                      >
                        <h3>{topology.name}</h3>
                        <div className="preview">
                          {/* Preview image would be generated */}
                          <div className="node-count">{topology.nodes.length} nodes</div>
                          <div className="link-count">{topology.links.length} links</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="control-panel">
              <SimulationControls 
                topologies={topologies} 
                onSimulationComplete={resultPromise => handleRunSimulation(resultPromise)} 
              />
              
              <div className="results-history">
                <h3>Previous Results</h3>
                <ul>
                  {historicalResults.slice(0, 5).map((result, index) => (
                    <li key={index} onClick={() => setSimulationResults(result)}>
                      {new Date(result.timestamp).toLocaleString()} - {result.protocol}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {view === 'results' && simulationResults && (
          <div className="results-view">
            <div className="result-header">
              <h2>Simulation Results</h2>
              <p>
                {new Date(simulationResults.timestamp).toLocaleString()} | 
                Topology: {topologies.find(t => t._id === simulationResults.topologyId)?.name} | 
                Protocol: {simulationResults.protocol} | 
                Users: {simulationResults.userCount} | 
                IoT Devices: {simulationResults.iotCount}
              </p>
            </div>
            
            <MetricsDashboard results={simulationResults} />
            
            <div className="result-actions">
              <button onClick={() => setView('simulate')}>Run New Simulation</button>
              <button onClick={() => alert('Export functionality would go here')}>
                Export Results
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;