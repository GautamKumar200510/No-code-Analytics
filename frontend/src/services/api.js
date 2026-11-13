import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getDatasets = async () => {
  const res = await api.get('/datasets');
  return res.data;
};

export const getDatasetDetails = async (id) => {
  const res = await api.get(`/dataset/${id}`);
  return res.data;
};

export const uploadDataset = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

export const preprocessData = async (datasetId, config) => {
  const res = await api.post('/preprocess', {
    dataset_id: datasetId,
    config,
  });
  return res.data;
};

export const getAlgorithms = async () => {
  const res = await api.get('/algorithms');
  return res.data;
};

export const getModels = async () => {
  const res = await api.get('/models');
  return res.data;
};

export const getModelDetails = async (modelId) => {
  const res = await api.get(`/model/${modelId}`);
  return res.data;
};

export const trainModel = async (trainingConfig) => {
  const res = await api.post('/train', trainingConfig);
  return res.data;
};

export const predictModel = async (modelId, inputs) => {
  const res = await api.post('/predict', {
    model_id: modelId,
    inputs,
  });
  return res.data;
};

export const getModelDownloadUrl = (modelId) => {
  return `${API_BASE}/model/${modelId}/download`;
};

export const validateWorkflow = async (nodes, edges) => {
  const res = await api.post('/workflow/validate', { nodes, edges });
  return res.data;
};

export const runWorkflow = async (nodes, edges) => {
  const res = await api.post('/workflow/run', { nodes, edges });
  return res.data;
};

export default api;
