import React, { useState } from 'react';
import { runSimulation } from '../services/api';

const SimulationControls = ({ topologies, onSimulationComplete }) => {
  const [selectedTopology, setSelectedTopology] = useState('');
  const [protocol, setProtocol] = useState('5G');
  const [userCount, setUserCount] = useState(100);
  const [iotCount, setIotCount] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopology) {
      setError('Please select a topology');
      return;
    }
    
    setIsRunning(true);
    setError('');
    
    try {
      const selectedTopoObj = topologies.find(t => t._id === selectedTopology);
      const result = await runSimulation({
        topologyId: selectedTopology,
        protocol,
        users: userCount,
        iotDevices: iotCount,
        topology: selectedTopoObj
      });
      onSimulationComplete(result);
    } catch (err) {
      setError('Simulation failed: ' + err.message);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="simulation-controls">
      <h2>Simulation Parameters</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Network Topology:</label>
          <select 
            value={selectedTopology} 
            onChange={e => setSelectedTopology(e.target.value)}
            required
          >
            <option value="">Select topology</option>
            {topologies.map(topo => (
              <option key={topo._id} value={topo._id}>
                {topo.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Protocol:</label>
          <div className="protocol-selector">
            <label>
              <input 
                type="radio" 
                value="5G" 
                checked={protocol === '5G'} 
                onChange={() => setProtocol('5G')} 
              />
              5G
            </label>
            <label>
              <input 
                type="radio" 
                value="6G" 
                checked={protocol === '6G'} 
                onChange={() => setProtocol('6G')} 
              />
              6G
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>User Equipment Count: {userCount}</label>
          <input 
            type="range" 
            min="1" 
            max="1000" 
            value={userCount} 
            onChange={e => setUserCount(parseInt(e.target.value))} 
          />
        </div>
        
        <div className="form-group">
          <label>IoT Devices: {iotCount}</label>
          <input 
            type="range" 
            min="0" 
            max="500" 
            value={iotCount} 
            onChange={e => setIotCount(parseInt(e.target.value))} 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isRunning}
          className={isRunning ? 'running' : ''}
        >
          {isRunning ? (
            <>
              <span className="spinner"></span> Running Simulation...
            </>
          ) : 'Run Simulation'}
        </button>
        
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default SimulationControls;