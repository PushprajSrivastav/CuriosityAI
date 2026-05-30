import apiClient from './apiClient';

/**
 * Send a prompt to the AI chat model
 * @param {string} prompt 
 */
export const askChatAPI = async (prompt) => {
  const response = await apiClient.post('/api/chat', { prompt });
  return response.data;
};
