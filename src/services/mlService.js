const axios = require('axios');
const logger = require('../utils/logger');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT) || 10000;

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Retry logic
const withRetry = async (fn, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      logger.warn(`ML service retry ${i + 1}/${retries}`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

// Predict crime category
const predict = async (text) => {
  return withRetry(async () => {
    const response = await mlClient.post('/predict', { text });
    return response.data;
  });
};

// Get model info
const getModelInfo = async () => {
  try {
    const response = await mlClient.get('/model-info');
    return response.data;
  } catch {
    return null;
  }
};

// Health check
const healthCheck = async () => {
  try {
    const response = await mlClient.get('/health');
    return { status: 'online', ...response.data };
  } catch {
    return { status: 'offline' };
  }
};

// Batch predict
const batchPredict = async (texts) => {
  return withRetry(async () => {
    const response = await mlClient.post('/batch-predict', { texts });
    return response.data;
  });
};

module.exports = { predict, getModelInfo, healthCheck, batchPredict };
