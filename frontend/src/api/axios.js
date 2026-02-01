import axios from 'axios';
import { showError } from '../utils/toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept auth endpoints (except /me)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/') && 
                          !originalRequest.url?.includes('/auth/me');
    
    // If 401 and not an auth endpoint and haven't retried yet
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        processQueue(null);
        isRefreshing = false;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        // Only redirect if we're not already on login/register pages
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(currentPath)) {
          // Clear any stale cookies/state
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
          showError('Session expired. Please login again.');
          
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For other errors, show appropriate message (but not for auth endpoints)
    if (!isAuthEndpoint) {
      if (error.response?.status === 403) {
        showError(error.response.data?.error?.message || 'Access denied');
      } else if (error.response?.status === 404) {
        showError(error.response.data?.error?.message || 'Resource not found');
      } else if (error.response?.status >= 500) {
        showError('Server error. Please try again later.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;