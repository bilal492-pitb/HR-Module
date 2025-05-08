import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  MenuItem,
  Divider,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import PropTypes from 'prop-types';

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

const EmployeeForm = ({ 
  initialValues = {}, 
  onSubmit, 
  loading = false, 
  error = null, 
  mode = 'create' // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    // Basic Information
    prefix: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    guardianType: 'S/O', // S/O, D/O, W/O
    guardianName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    cnic: '',
    gender: '',
    language: '',
    religion: '',
    maritalStatus: '',
    
    // Location Information
    domicile: '',
    district: '',
    
    // Contact Information
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Employment Information
    dateOfJoining: '',
    typeOfEmployment: '',
    appointmentGrade: '',
    dateOfSuperannuation: '',
    gradeType: 'Regular', // Regular or Acting
    postGrade: '',
    currentPost: '',
    department: '',
    employmentStatus: '',
    role: '', // Role field
    
    ...initialValues
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [roles, setRoles] = useState([]);
  
  // Fetch roles from local storage
  useEffect(() => {
    const fetchedRoles = getRolesFromLocalStorage();
    setRoles(fetchedRoles);
  }, []);
  
  // Update form when initialValues changes
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(prevData => ({
        ...prevData,
        ...initialValues
      }));
    }
  }, [initialValues]);
  
  const handleInputChange = (e) => {
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
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.employeeId) {
      errors.employeeId = 'Employee ID is required';
    }
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.guardianName) {
      errors.guardianName = 'Guardian name is required';
    }
    if (!formData.cnic) {
      errors.cnic = 'CNIC is required';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="prefix"
              label="Prefix (Mr/Ms/Dr)"
              select
              fullWidth
              value={formData.prefix || ''}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="Mr">Mr</MenuItem>
              <MenuItem value="Ms">Ms</MenuItem>
              <MenuItem value="Mrs">Mrs</MenuItem>
              <MenuItem value="Dr">Dr</MenuItem>
              <MenuItem value="Prof">Prof</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="employeeId"
              label="Employee ID"
              fullWidth
              required
              value={formData.employeeId}
              onChange={handleInputChange}
              error={!!formErrors.employeeId}
              helperText={formErrors.employeeId}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="guardianType"
              label="Guardian Relation"
              select
              fullWidth
              value={formData.guardianType || 'S/O'}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="S/O">S/O (Son of)</MenuItem>
              <MenuItem value="D/O">D/O (Daughter of)</MenuItem>
              <MenuItem value="W/O">W/O (Wife of)</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="guardianName"
              label="Guardian Name"
              fullWidth
              required
              value={formData.guardianName || ''}
              onChange={handleInputChange}
              error={!!formErrors.guardianName}
              helperText={formErrors.guardianName}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              fullWidth
              value={formData.dateOfBirth || ''}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="placeOfBirth"
              label="Place of Birth"
              fullWidth
              value={formData.placeOfBirth || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="cnic"
              label="CNIC"
              fullWidth
              required
              value={formData.cnic || ''}
              onChange={handleInputChange}
              error={!!formErrors.cnic}
              helperText={formErrors.cnic}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="gender"
              label="Gender"
              select
              fullWidth
              value={formData.gender || ''}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="language"
              label="Language"
              fullWidth
              value={formData.language || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="religion"
              label="Religion"
              fullWidth
              value={formData.religion || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="maritalStatus"
              label="Marital Status"
              select
              fullWidth
              value={formData.maritalStatus || ''}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Widowed">Widowed</MenuItem>
            </TextField>
          </Grid>

          {/* Domicile Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Domicile Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="domicile"
              label="Domicile"
              fullWidth
              value={formData.domicile || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="district"
              label="District"
              fullWidth
              value={formData.district || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="email"
              label="Email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="phoneNumber"
              label="Phone Number"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="address"
              label="Address"
              fullWidth
              value={formData.address || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          {/* Employment Details */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Employment Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="dateOfJoining"
              label="Date of Joining"
              type="date"
              fullWidth
              value={formData.dateOfJoining || ''}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="typeOfEmployment"
              label="Type of Employment"
              select
              fullWidth
              value={formData.typeOfEmployment || ''}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="Permanent">Permanent</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Temporary">Temporary</MenuItem>
              <MenuItem value="Probation">Probation</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="employmentStatus"
              label="Employment Status"
              select
              fullWidth
              value={formData.employmentStatus || ''}
              onChange={handleInputChange}
              disabled={loading}
            >
              <MenuItem value="Full-Time">Full-Time</MenuItem>
              <MenuItem value="Part-Time">Part-Time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Intern">Intern</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="appointmentGrade"
              label="Appointment Grade"
              fullWidth
              value={formData.appointmentGrade || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="dateOfSuperannuation"
              label="Date of Superannuation"
              type="date"
              fullWidth
              value={formData.dateOfSuperannuation || ''}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Grade Type</FormLabel>
              <RadioGroup
                row
                name="gradeType"
                value={formData.gradeType || 'Regular'}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Regular" control={<Radio />} label="Regular" disabled={loading} />
                <FormControlLabel value="Acting" control={<Radio />} label="Acting" disabled={loading} />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="postGrade"
              label="Post Grade"
              fullWidth
              value={formData.postGrade || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="currentPost"
              label="Current Post"
              fullWidth
              value={formData.currentPost || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="department"
              label="Department"
              select
              fullWidth
              required
              value={formData.department || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!formErrors.department}
              helperText={formErrors.department || 'Required'}
            >
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Agriculture">Agriculture</MenuItem>
              <MenuItem value="Drug">Drug</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Legal">Legal</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="role"
              label="Role"
              select
              fullWidth
              required
              value={formData.role || ''}
              onChange={handleInputChange}
              disabled={loading}
              error={!!formErrors.role}
              helperText={formErrors.role || 'Role is required'}
            >
              {roles.length > 0 ? (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>No roles available</MenuItem>
              )}
            </TextField>
          </Grid>
          
          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                component={RouterLink}
                to="/employees"
                variant="outlined"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Employee' : 'Update Employee'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

EmployeeForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  mode: PropTypes.oneOf(['create', 'edit'])
};

export default EmployeeForm; 