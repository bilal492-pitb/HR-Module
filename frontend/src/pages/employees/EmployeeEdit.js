import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import EmployeeForm from '../../components/employees/EmployeeForm';
import { getEmployeeById, updateEmployee } from '../../services/employeeService';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user has HR permissions
    if (!hasRole('hr')) {
      navigate('/');
      return;
    }
    
    fetchEmployee();
  }, [id, hasRole, navigate]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      // Only use API
      const response = await getEmployeeById(id);
      setEmployee(response.data);
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      // Only use API
      await updateEmployee(id, formData);
      setSnackbar({
        open: true,
        message: 'Employee updated successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        navigate(`/employees/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.message || 'Failed to update employee. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to update employee: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !employee) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box>
        <Alert severity="error">Employee not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Employee
      </Typography>
      
      <EmployeeForm
        initialValues={employee}
        onSubmit={handleSubmit}
        loading={submitting}
        error={error}
        mode="edit"
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
    </Box>
  );
};

export default EmployeeEdit; 