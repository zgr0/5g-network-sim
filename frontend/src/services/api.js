import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getTopologies = async () => {
  const response = await axios.get(`${API_URL}/topologies`);
  return response.data;
};

export const saveTopology = async (topology) => {
  const response = await axios.post(`${API_URL}/topologies`, topology);
  return response.data;
};

export const runSimulation = async (params) => {
  const response = await axios.post(`${API_URL}/simulate`, params);
  return response.data;
};

export const getResults = async () => {
  const response = await axios.get(`${API_URL}/results`);
  return response.data;
};