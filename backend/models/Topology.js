const mongoose = require('mongoose');

const topologySchema = new mongoose.Schema({
  name: String,
  description: String,
  nodes: [{
    id: String,
    type: { type: String, enum: ['baseStation', 'userEquipment', 'iotDevice'] },
    x: Number,
    y: Number,
    parameters: Object
  }],
  links: [{
    source: String,
    target: String,
    bandwidth: Number,
    latency: Number
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topology', topologySchema);