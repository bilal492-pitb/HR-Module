import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import EmployeeForm from '../../components/employees/EmployeeForm';
import { processFileForStorage, getStoredEmployees, storeCompressedEmployees, checkStorageSpace } from '../../utils/storageUtils';
import { createEmployee } from '../../services/employeeService';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Function to generate a username based on employee name
const generateUsername = (firstName, lastName, employeeId) => {
  const firstInitial = firstName ? firstName.charAt(0).toLowerCase() : '';
  const lastNamePart = lastName ? lastName.toLowerCase() : '';
  const idPart = employeeId ? employeeId.replace(/\D/g, '') : '';
  return `${firstInitial}${lastNamePart}${idPart}`.replace(/\s+/g, '');
};

// Function to generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to get roles from local storage
const getRolesFromLocalStorage = () => {
  try {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  } catch (error) {
    console.error('Error getting roles from localStorage:', error);
    return [];
  }
};

// Function to get role logs from local storage
const getRoleLogsFromLocalStorage = () => {
  try {
    const roleLogs = localStorage.getItem('roleLogs');
    return roleLogs ? JSON.parse(roleLogs) : [];
  } catch (error) {
    console.error('Error getting role logs from localStorage:', error);
    return [];
  }
};

// Function to save role logs to local storage
const saveRoleLogsToLocalStorage = (roleLogs) => {
  try {
    localStorage.setItem('roleLogs', JSON.stringify(roleLogs));
  } catch (error) {
    console.error('Error saving role logs to localStorage:', error);
  }
};

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const { hasRole, currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storageWarningOpen, setStorageWarningOpen] = useState(false);
  const [storageStats, setStorageStats] = useState({
    used: 0,
    available: 0,
    totalEmployees: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user has HR permissions
    if (!hasRole('hr')) {
      navigate('/');
    }
    
    // Check storage space on component mount
    const spaceInfo = checkStorageSpace();
    setStorageStats(spaceInfo);
    
    // Show warning if storage is low
    if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
      setStorageWarningOpen(true);
    }
  }, [hasRole, navigate]);

  // Function to log role assignment
  const logRoleAssignment = async (employeeId, roleId) => {
    try {
      // Get role name from role id
      const roles = getRolesFromLocalStorage();
      const role = roles.find(r => r.id === roleId);
      
      if (!role) {
        console.error('Role not found:', roleId);
        return;
      }

      const roleName = role.name;
      
      const newLog = {
        id: Date.now(),
        employeeId: employeeId,
        oldRole: '', // No previous role for new employee
        newRole: roleName,
        changeDate: new Date().toISOString().substr(0, 10),
        changedBy: currentUser?.username || 'admin',
        reason: 'Initial role assignment on employee creation',
        timestamp: new Date().toISOString()
      };

      // Try to save via API
      try {
        await axios.post(`${API_BASE_URL}/api/role-logs`, newLog);
      } catch (apiError) {
        console.warn('API call failed when logging role, using localStorage:', apiError);
        
        // Fallback to localStorage
        const roleLogs = getRoleLogsFromLocalStorage();
        saveRoleLogsToLocalStorage([...roleLogs, newLog]);
      }
    } catch (error) {
      console.error('Error logging role assignment:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate username and password if not provided
      if (!formData.username) {
        formData.username = generateUsername(formData.firstName, formData.lastName, formData.employeeId);
      }
      
      if (!formData.password) {
        formData.password = generatePassword();
      }
      
      // Process profile picture if present
      let profilePictureFile = null;
      if (formData.profilePicture && typeof formData.profilePicture === 'object') {
        profilePictureFile = formData.profilePicture;
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(formData.profilePicture, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8
        });
        
        formData.profilePicture = processedFile;
      }
      
      // Try using the API first
      try {
        // Create API-compatible form data
        const apiFormData = {
          ...formData,
          profilePictureFile: profilePictureFile
        };
        
        const response = await createEmployee(apiFormData);
        
        // If role was assigned, log it
        if (formData.role) {
          await logRoleAssignment(response.data.id, formData.role);
        }
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Employee created successfully!',
          severity: 'success'
        });
        
        // Navigate to the employee list after a short delay
        setTimeout(() => {
          navigate('/employees');
        }, 1500);
        
        return;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // If API fails, fall back to localStorage
      }
      
      // Check if we have enough space
      const spaceInfo = checkStorageSpace();
      if (parseFloat(spaceInfo.available) < 0.2) { // Less than 200KB available
        setSnackbar({
          open: true,
          message: 'Storage space is too low. Please delete some data first.',
          severity: 'error'
        });
        setStorageWarningOpen(true);
        return;
      }
      
      // For demo: Store in localStorage
      try {
        const currentEmployees = getStoredEmployees() || [];
        
        // Create a new employee object
        const newEmployee = {
          id: Date.now(),
          ...formData,
          qualifications: [],
          dependents: [],
          trainings: [],
          medicalRecords: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to employees array
        const updatedEmployees = [...currentEmployees, newEmployee];
        
        // Save to localStorage with compression
        storeCompressedEmployees(updatedEmployees);
        
        // If role was assigned, log it
        if (formData.role) {
          await logRoleAssignment(newEmployee.id, formData.role);
        }
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Employee created successfully!',
          severity: 'success'
        });
        
        // Navigate to the employee list after a short delay
        setTimeout(() => {
          navigate('/employees');
        }, 1500);
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
        throw new Error('Failed to save employee data');
      }
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to create employee: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  const handleCloseStorageWarning = () => {
    setStorageWarningOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Employee
      </Typography>
      
      {storageStats && (
        <Alert severity={parseFloat(storageStats.available) < 0.5 ? "warning" : "info"} sx={{ mb: 2 }}>
          Storage usage: {storageStats.used}MB of {storageStats.totalEmployees}MB ({parseFloat(storageStats.available) < 0.5 ? "Storage space is running low." : "Storage space is sufficient."})
        </Alert>
      )}
      
      <EmployeeForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        mode="create"
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={storageWarningOpen}
        onClose={handleCloseStorageWarning}
      >
        <DialogTitle>
          Storage Space Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your browser storage is {parseFloat(storageStats.available) < 0.5 ? "running low." : "sufficient."}
            {parseFloat(storageStats.available) < 0.5 && " Consider clearing old data or exporting employees to prevent data loss."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStorageWarning} color="primary">
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeCreate; 