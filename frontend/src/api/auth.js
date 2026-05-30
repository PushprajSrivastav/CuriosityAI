import apiClient from './apiClient';

/**
 * Register a new user
 * @param {Object} userData - { username, email, password }
 */
export const registerAPI = async (userData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

/**
 * Verify user email with OTP code
 * @param {string} email 
 * @param {string} code 
 */
export const verifyEmailAPI = async (email, code) => {
  const response = await apiClient.get('/api/auth/verify', {
    params: { email, code }
  });
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export const loginAPI = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

/**
 * Get currently logged-in user profile
 */
export const getMeAPI = async () => {
  const response = await apiClient.get('/api/auth/get-me');
  return response.data;
};

/**
 * Logout user
 */
export const logoutAPI = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};

/**
 * Request password reset OTP code
 * @param {string} email 
 */
export const forgotPasswordAPI = async (email) => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password using OTP code
 * @param {string} email 
 * @param {string} code 
 * @param {string} newPassword 
 */
export const resetPasswordAPI = async (email, code, newPassword) => {
  const response = await apiClient.post('/api/auth/reset-password', { email, code, newPassword });
  return response.data;
};
