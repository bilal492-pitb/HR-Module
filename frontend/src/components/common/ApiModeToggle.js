import React, { useState, useEffect } from 'react';
import { FormControlLabel, Switch, Tooltip, Box, Typography, Snackbar, Alert } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import apiConfig from '../../config/api';

const ApiModeToggle = () => {
  const [isProduction, setIsProduction] = useState(!apiConfig.isDemoMode());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    // Initialize mode based on localStorage
    setIsProduction(!apiConfig.isDemoMode());
  }, []);

  const handleToggle = (event) => {
    const isChecked = event.target.checked;
    setIsProduction(isChecked);
    
    // Update API mode
    apiConfig.setApiMode(isChecked ? 'production' : 'demo');
    
    // Show notification
    setSnackbar({
      open: true,
      message: isChecked 
        ? 'Switched to production mode with backend API' 
        : 'Switched to demo mode with localStorage',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          px: 2, 
          py: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 1
        }}
      >
        <Tooltip title={isProduction ? "Using backend API" : "Using localStorage"}>
          {isProduction ? <CloudIcon color="primary" /> : <StorageIcon color="action" />}
        </Tooltip>
        
        <FormControlLabel
          control={
            <Switch
              checked={isProduction}
              onChange={handleToggle}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isProduction ? 'Production Mode' : 'Demo Mode'}
            </Typography>
          }
          sx={{ ml: 1 }}
        />
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApiModeToggle; 