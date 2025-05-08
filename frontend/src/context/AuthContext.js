import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import apiConfig from '../config/api';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on page load)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Handle demo token differently
        if (token.startsWith('demo_token_')) {
          // In demo mode, get user from localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user && user.username) {
            setCurrentUser({
              ...user,
              token
            });
            apiConfig.setApiMode('demo');
          } else {
            // Invalid demo user
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setLoading(false);
          return;
        }
        
        // For regular tokens, check with the backend
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('/api/auth/profile');
          setCurrentUser({
            ...response.data.user,
            token
          });
        } catch (apiErr) {
          // Token invalid or expired
          localStorage.removeItem('token');
          setCurrentUser(null);
          setError('Session expired. Please login again.');
        }
      } catch (err) {
        setCurrentUser(null);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for demo credentials
      if (isDemoUser(credentials.username, credentials.password)) {
        return handleDemoLogin(credentials.username);
      }
      
      // Regular API login
      const response = await axios.post('/api/auth/login', credentials);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser({
        ...user,
        token
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check if credentials match a demo user
  const isDemoUser = (username, password) => {
    const demoUsers = {
      'admin': 'admin123',
      'hrmanager': 'hr123',
      'manager': 'manager123',
      'employee': 'employee123'
    };
    
    return demoUsers[username] === password;
  };
  
  // Function to handle demo login
  const handleDemoLogin = (username) => {
    const roleMap = {
      'admin': 'admin',
      'hrmanager': 'hr',
      'manager': 'manager',
      'employee': 'employee'
    };
    
    // Create mock user
    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      username: username,
      email: `${username}@example.com`,
      role: roleMap[username] || 'employee'
    };
    
    const mockToken = 'demo_token_' + Math.random().toString(36).substring(2);
    
    // Store in localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Configure API for demo mode
    apiConfig.setApiMode('demo');
    
    // Update context
    setCurrentUser({
      ...mockUser,
      token: mockToken
    });
    
    return { success: true };
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // In demo mode, simulate registration
      if (apiConfig.isDemoMode()) {
        return handleDemoLogin(userData.username);
      }
      
      // Regular registration
      const response = await axios.post('/api/auth/register', userData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser({
        ...user,
        token
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      // In demo mode, simulate password change
      if (apiConfig.isDemoMode()) {
        return { success: true };
      }
      
      await axios.post('/api/auth/change-password', passwordData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (role === 'admin') {
      return currentUser.role === 'admin';
    } else if (role === 'hr') {
      return ['admin', 'hr'].includes(currentUser.role);
    } else if (role === 'manager') {
      return ['admin', 'hr', 'manager'].includes(currentUser.role);
    }
    return true; // Default for 'employee' role
  };

  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        register,
        changePassword,
        clearError,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};