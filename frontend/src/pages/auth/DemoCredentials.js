import React from 'react';
import { Paper, Typography, Box, Grid, Divider } from '@mui/material';

const DemoCredentials = () => {
  const credentials = [
    { role: 'Admin', username: 'admin', password: 'admin123', description: 'Full access to all features' },
    { role: 'HR Manager', username: 'hrmanager', password: 'hr123', description: 'Access to employee management and HR functions' },
    { role: 'Manager', username: 'manager', password: 'manager123', description: 'Access to team management and reports' },
    { role: 'Employee', username: 'employee', password: 'employee123', description: 'Basic access to personal information' }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom color="#005F2F">
        Demo Credentials
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use one of these accounts to log in to the demo:
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {credentials.map((cred) => (
          <Grid item xs={12} key={cred.role}>
            <Box sx={{ 
              p: 1.5, 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(0, 95, 47, 0.05)' }
            }}>
              <Grid container alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#005F2F">
                    {cred.role}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">
                    <strong>Username:</strong> {cred.username}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">
                    <strong>Password:</strong> {cred.password}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="#A9DEF9">
                    {cred.description}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DemoCredentials; 