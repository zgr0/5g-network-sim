import api from './api';

export const getTopologies = async () => {
  const response = await api.get('/topologies');
  return response.data;
};

export const saveTopology = async (topology) => {
  const response = await api.post('/topologies', topology);
  return response.data;
};

export const loadExample = async (exampleId) => {
  // Could fetch from backend or use local examples
  return exampleTopologies.find(e => e.id === exampleId);
};