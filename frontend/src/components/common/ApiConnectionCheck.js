import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import apiConfig from '../../config/api';

/**
 * Component that checks API connectivity and falls back to demo mode
 * if the API is unreachable. This helps prevent API connection errors.
 */
const ApiConnectionCheck = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    // Only do the check if we're not already in demo mode
    if (!apiConfig.isDemoMode()) {
      checkApiConnection();
    }
  }, []);

  const checkApiConnection = async () => {
    try {
      // Try multiple endpoints in case some don't exist
      try {
        // Try health-check endpoint first
        await axios.get(`${API_BASE_URL}/api/health-check`, { 
          timeout: 5000
        });
        console.log('API health check successful');
        return;
      } catch (healthError) {
        console.warn('Health check endpoint failed, trying roles endpoint');
        
        // If health check fails, try the roles endpoint
        await axios.get(`${API_BASE_URL}/api/roles`, { 
          timeout: 5000
        });
        console.log('API roles endpoint successful');
        return;
      }
    } catch (error) {
      console.error('API connection check failed:', error);
      
      // API is unreachable, switch to demo mode
      apiConfig.setApiMode('demo');
      
      // Ensure we have mock data in localStorage
      import('../../config/mockData').then(({ mockRoles, mockPermissions, mockPosts }) => {
        // Initialize mock data in localStorage if empty
        if (!localStorage.getItem('roles') || JSON.parse(localStorage.getItem('roles')).length === 0) {
          localStorage.setItem('roles', JSON.stringify(mockRoles));
          console.log('Initialized mock roles in localStorage during API check');
        }
        
        if (!localStorage.getItem('permissions') || JSON.parse(localStorage.getItem('permissions')).length === 0) {
          localStorage.setItem('permissions', JSON.stringify(mockPermissions));
          console.log('Initialized mock permissions in localStorage during API check');
        }
        
        if (!localStorage.getItem('posts') || JSON.parse(localStorage.getItem('posts')).length === 0) {
          localStorage.setItem('posts', JSON.stringify(mockPosts));
          console.log('Initialized mock posts in localStorage during API check');
        }
      }).catch(err => {
        console.error('Failed to initialize mock data during API check:', err);
      });
      
      // Show notification
      setSnackbar({
        open: true,
        message: 'Backend API seems unreachable. Switching to demo mode with local storage.',
        severity: 'warning'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={snackbar.severity}
        variant="filled"
        elevation={6}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default ApiConnectionCheck; 