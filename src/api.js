import axios from 'axios';

// Define API URL - will use proxy in development, direct URL in production
const API_URL = process.env.REACT_APP_API_URL || '';

// API service for crawler operations
const api = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Start a new crawl
  startCrawl: async (domains, maxDepth) => {
    try {
      const response = await axios.post(`${API_URL}/crawl/`, {
        domains,
        max_depth: maxDepth
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get task status
  getTaskStatus: async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/task/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel a running task
  cancelTask: async (taskId) => {
    try {
      const response = await axios.delete(`${API_URL}/task/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get crawled URLs for a domain
  getUrls: async (taskId, domain) => {
    try {
      const response = await axios.get(`${API_URL}/urls/${taskId}/${domain}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 