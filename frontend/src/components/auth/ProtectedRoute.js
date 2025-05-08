import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useContext(AuthContext);

  // Show loading spinner while authentication state is being checked
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If specific role is required, check for it
  if (requiredRole) {
    const hasRole = (role) => {
      if (role === 'admin') {
        return currentUser.role === 'admin';
      } else if (role === 'hr') {
        return ['admin', 'hr'].includes(currentUser.role);
      } else if (role === 'manager') {
        return ['admin', 'hr', 'manager'].includes(currentUser.role);
      }
      return true; // Default for 'employee' role
    };

    if (!hasRole(requiredRole)) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/" />;
    }
  }

  // If authenticated and has required role, render children
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

export default ProtectedRoute; 