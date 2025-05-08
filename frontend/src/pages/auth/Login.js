import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Avatar, 
  Button, 
  TextField, 
  Link, 
  Grid, 
  Box, 
  Typography, 
  Container, 
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../../context/AuthContext';
import DemoCredentials from './DemoCredentials';
import apiConfig from '../../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  
  const { currentUser, error, clearError, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
    
    // Check if we should show demo credentials (only in development)
    const isDemoEnvironment = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               apiConfig.isDemoMode();
    setShowDemoCredentials(isDemoEnvironment);
  }, [currentUser, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear API error
    if (error) {
      clearError();
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Username is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if using demo credentials
      if (isDemoUser(formData.username)) {
        handleDemoLogin(formData.username);
        return;
      }
      
      // Try regular login via AuthContext
      const result = await login(formData);
      
      if (!result.success) {
        setFormErrors({ password: result.error || 'Invalid username or password' });
        setIsSubmitting(false);
        return;
      }
      
      // Redirect to dashboard on success
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setIsSubmitting(false);
      setFormErrors({ password: 'Invalid username or password' });
    }
  };
  
  // Function to check if credentials match a demo user
  const isDemoUser = (username) => {
    const demoUsers = {
      'admin': 'admin123',
      'hrmanager': 'hr123',
      'manager': 'manager123',
      'employee': 'employee123'
    };
    
    return demoUsers[username] === formData.password;
  };
  
  // Function to handle demo login
  const handleDemoLogin = (username) => {
    const roleMap = {
      'admin': 'admin',
      'hrmanager': 'hr',
      'manager': 'manager',
      'employee': 'employee'
    };
    
    // Create mock user and token
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
    
    // Navigate to dashboard
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };
  
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: '#005F2F' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" color="#005F2F">
                Login
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username or Email"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                  disabled={isSubmitting}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#005F2F',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#005F2F',
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={isSubmitting}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#005F2F',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#005F2F',
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: showPassword ? '#005F2F' : 'inherit' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    bgcolor: '#F7A41D',
                    color: '#000000',
                    '&:hover': {
                      bgcolor: '#E09218',
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: '#000000' }} />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#005F2F' }}>
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link component={RouterLink} to="/register" variant="body2" sx={{ color: '#005F2F' }}>
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          {showDemoCredentials && (
            <Grid item xs={12} md={6}>
              <DemoCredentials />
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Login; 