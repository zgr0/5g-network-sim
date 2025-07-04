// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Ağ topolojisi ve parametre veritabanı
let networkTopology = {
  nodes: [],
  links: []
};

// Simülasyon sonuçları
const simulationResults = [];

// Topoloji oluşturma endpoint'i
app.post('/api/topology', (req, res) => {
  networkTopology = req.body;
  console.log('Topoloji güncellendi:', networkTopology);
  res.status(200).json({ message: 'Topoloji başarıyla güncellendi' });
});

// Simülasyon çalıştırma endpoint'i
app.post('/api/simulate', (req, res) => {
  const { protocol, users, iotDevices, topologyId, topology } = req.body;

  // Use provided topology if available, else use global
  const topo = topology || networkTopology;

  // Assign radio access type to each node (5G: mmWave or sub-6 GHz, 6G: all ultra mmWave)
  const nodesWithRadio = topo.nodes.map(node => {
    let radio;
    if (protocol === '5G') {
      radio = Math.random() < 0.5 ? 'mmWave' : 'sub-6GHz';
    } else {
      radio = 'ultra-mmWave';
    }
    return { ...node, radio };
  });

  // Network slicing: split users/IoT into 3 slices (eMBB, URLLC, mMTC)
  const slices = [
    { name: 'eMBB', users: Math.floor(users * 0.5), iot: Math.floor(iotDevices * 0.2) },
    { name: 'URLLC', users: Math.floor(users * 0.2), iot: Math.floor(iotDevices * 0.3) },
    { name: 'mMTC', users: users - Math.floor(users * 0.7), iot: iotDevices - Math.floor(iotDevices * 0.5) }
  ];

  // Massive IoT constraint for 5G: max 200 IoT devices per cell
  let iotWarning = null;
  if (protocol === '5G') {
    const maxIoTPerCell = 200;
    if (iotDevices > maxIoTPerCell * nodesWithRadio.length) {
      iotWarning = `5G constraint: Too many IoT devices for available cells (max ${maxIoTPerCell} per cell).`;
    }
  }

  // Simulate latency: protocol and radio dependent
  function simulateLatency(nodes, userCount) {
    return nodes.map(node => {
      let base, jitter;
      if (protocol === '5G') {
        base = node.radio === 'mmWave' ? 5 : 10;
        jitter = 5;
      } else {
        base = 1.5; // 6G ultra-low
        jitter = 2;
      }
      return {
        nodeId: node.id,
        radio: node.radio,
        latency: base + Math.random() * jitter
      };
    });
  }

  // Simulate bandwidth: protocol and radio dependent
  function simulateBandwidth(topology, iotDevices) {
    return topology.links.map(link => {
      // Find source/target node radios
      const sourceNode = nodesWithRadio.find(n => n.id === (link.source.id || link.source));
      const targetNode = nodesWithRadio.find(n => n.id === (link.target.id || link.target));
      let base, jitter;
      if (protocol === '5G') {
        base = (sourceNode.radio === 'mmWave' && targetNode.radio === 'mmWave') ? 1000 : 300;
        jitter = 200;
      } else {
        base = 5000; // 6G much higher
        jitter = 1000;
      }
      return {
        source: link.source,
        target: link.target,
        bandwidth: base + Math.random() * jitter
      };
    });
  }

  // Simulate throughput per slice
  function simulateThroughput(protocol, slices) {
    return slices.map(slice => {
      let base;
      if (protocol === '5G') {
        if (slice.name === 'eMBB') base = 1000;
        else if (slice.name === 'URLLC') base = 300;
        else base = 100;
      } else {
        if (slice.name === 'eMBB') base = 5000;
        else if (slice.name === 'URLLC') base = 1000;
        else base = 500;
      }
      return {
        slice: slice.name,
        average: base * 0.8,
        max: base,
        min: base * 0.6
      };
    });
  }

  const latencyResults = simulateLatency(nodesWithRadio, users);
  const bandwidthResults = simulateBandwidth(topo, iotDevices);
  const throughputResults = simulateThroughput(protocol, slices);

  const result = {
    timestamp: Date.now(),
    protocol,
    userCount: users,
    iotCount: iotDevices,
    topologyId,
    latency: latencyResults,
    bandwidth: bandwidthResults,
    throughput: throughputResults,
    slices,
    iotWarning
  };

  simulationResults.unshift(result);

  res.json(result);
});

// Dummy GET endpoint for topologies (returns empty array for now)
app.get('/api/topologies', (req, res) => {
  res.json([]);
});

// Gecikme simülasyonu
function simulateLatency(topology, userCount) {
  return topology.nodes.map(node => ({
    nodeId: node.id,
    latency: Math.random() * 20 + 5 // 5-25ms arası
  }));
}

// Bant genişliği simülasyonu
function simulateBandwidth(topology, iotDevices) {
  return topology.links.map(link => ({
    source: link.source,
    target: link.target,
    bandwidth: (Math.random() * 90 + 10) // 10-100 Mbps
  }));
}

// Verim simülasyonu
function simulateThroughput(protocol, userCount) {
  const baseThroughput = protocol === '5G' ? 100 : 500; // 6G daha yüksek
  return {
    average: baseThroughput * 0.8,
    max: baseThroughput,
    min: baseThroughput * 0.6
  };
}

// Sonuçları getirme endpoint'i
app.get('/api/results', (req, res) => {
  res.json(simulationResults);
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});