import axios from 'axios';

// Central Axios Instance for all API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Point to hosted backend in production, fall back to empty (Vite proxy) in development
  withCredentials: true, // Send cookies automatically (e.g. for token-based auth)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor to handle errors globally if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global error messages here (like redirecting on 401)
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
