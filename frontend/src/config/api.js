/* eslint-disable no-undef */
import axios from 'axios';

// Base URL for all API requests
// Use environment variable if set, otherwise use localhost for development
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
/* eslint-enable no-undef */

// Default headers for all requests
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add auth token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Setup response interceptor for detecting auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service configuration
const apiConfig = {
  timeout: 30000, // 30 seconds
  withCredentials: false,
  
  // Function to show fallback message
  handleApiError: (error, fallbackMessage = 'An error occurred') => {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return fallbackMessage;
  },
  
  // Function to setup API mode
  setApiMode: (mode) => {
    if (mode === 'demo') {
      // In demo mode, use localStorage and mock APIs
      localStorage.setItem('apiMode', 'demo');
      
      // Initialize mock data in localStorage if empty
      import('../config/mockData').then(({ mockRoles, mockPermissions, mockPosts }) => {
        if (!localStorage.getItem('roles') || JSON.parse(localStorage.getItem('roles')).length === 0) {
          localStorage.setItem('roles', JSON.stringify(mockRoles));
          console.log('Initialized mock roles in localStorage');
        }
        
        if (!localStorage.getItem('permissions') || JSON.parse(localStorage.getItem('permissions')).length === 0) {
          localStorage.setItem('permissions', JSON.stringify(mockPermissions));
          console.log('Initialized mock permissions in localStorage');
        }
        
        if (!localStorage.getItem('posts') || JSON.parse(localStorage.getItem('posts')).length === 0) {
          localStorage.setItem('posts', JSON.stringify(mockPosts));
          console.log('Initialized mock posts in localStorage');
        }
      }).catch(err => {
        console.error('Failed to initialize mock data:', err);
      });
    } else {
      // In production mode, use real APIs
      localStorage.setItem('apiMode', 'production');
    }
  },
  
  // Function to check current API mode
  isDemoMode: () => {
    return localStorage.getItem('apiMode') === 'demo';
  }
};

export default apiConfig; 