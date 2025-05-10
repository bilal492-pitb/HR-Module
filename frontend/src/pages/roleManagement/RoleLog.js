import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { getStoredEmployees } from '../../utils/storageUtils';
import { API_BASE_URL } from '../../config/api';
import axios from 'axios';

// Local storage functions to ensure data persistence
const saveRoleLogsToLocalStorage = (roleLogs) => {
  try {
    localStorage.setItem('roleLogs', JSON.stringify(roleLogs));
  } catch (error) {
    console.error('Error saving role logs to localStorage:', error);
  }
};

const getRoleLogsFromLocalStorage = () => {
  try {
    const roleLogs = localStorage.getItem('roleLogs');
    return roleLogs ? JSON.parse(roleLogs) : [];
  } catch (error) {
    console.error('Error getting role logs from localStorage:', error);
    return [];
  }
};

// Function to get roles from localStorage
const getRolesFromLocalStorage = () => {
  try {
    const roles = localStorage.getItem('roles');
    const parsedRoles = roles ? JSON.parse(roles) : [];
    console.log('Roles from localStorage:', parsedRoles);
    
    // If no roles found, provide default roles
    if (!parsedRoles || parsedRoles.length === 0) {
      console.log('No roles found in localStorage, using default roles');
      const defaultRoles = [
        { id: '1', name: 'Admin', description: 'Administrator with full access' },
        { id: '2', name: 'HR', description: 'Human Resources staff' },
        { id: '3', name: 'Manager', description: 'Department manager' },
        { id: '4', name: 'Employee', description: 'Regular employee' }
      ];
      
      // Save default roles to localStorage for future use
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
      return defaultRoles;
    }
    
    return parsedRoles;
  } catch (error) {
    console.error('Error getting roles from localStorage:', error);
    // Return default roles as fallback
    return [
      { id: '1', name: 'Admin', description: 'Administrator with full access' },
      { id: '2', name: 'HR', description: 'Human Resources staff' },
      { id: '3', name: 'Manager', description: 'Department manager' },
      { id: '4', name: 'Employee', description: 'Regular employee' }
    ];
  }
};

const RoleLog = () => {
  const [roleLogs, setRoleLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    oldRoleId: '',
    oldRoleName: '',
    newRoleId: '',
    newRoleName: '',
    changeDate: new Date().toISOString().substr(0, 10), // Today's date
    changedBy: 'admin', // Default value
    reason: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading initial data for RoleLog component");
        // Load roles first since they're needed for other operations
        const fetchedRoles = await fetchRoles();
        console.log("Initial roles loaded:", fetchedRoles);
        
        // Then load employees and role logs
        fetchEmployees();
        fetchRoleLogs();
      } catch (error) {
        console.error("Error during initial data loading:", error);
        // Still try to load employees and role logs even if roles fail
        fetchEmployees();
        fetchRoleLogs();
      }
    };
    
    loadData();
  }, []);

  const fetchRoleLogs = async () => {
    try {
      // Try API first
      const response = await axios.get(`${API_BASE_URL}/api/role-logs`);
      const data = response.data;
      setRoleLogs(migrateRoleLogs(data));
      saveRoleLogsToLocalStorage(migrateRoleLogs(data));
    } catch (error) {
      console.error('Error fetching role logs from API:', error);
      
      // Fallback to localStorage
      const localRoleLogs = getRoleLogsFromLocalStorage();
      setRoleLogs(migrateRoleLogs(localRoleLogs));
    }
  };

  const fetchRoles = async () => {
    try {
      // Try API first
      try {
        const response = await axios.get(`${API_BASE_URL}/api/roles`);
        console.log('Roles from API:', response.data);
        setRoles(response.data);
        return response.data;
      } catch (apiError) {
        console.error('Error fetching roles from API:', apiError);
        // Fallback to localStorage - don't throw error here
      }
      
      // Fallback to localStorage
      const localRoles = getRolesFromLocalStorage();
      console.log('Roles from localStorage:', localRoles);
      setRoles(localRoles);
      return localRoles;
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      // Return empty array instead of throwing error to prevent dialog issues
      return [];
    }
  };

  const fetchEmployees = () => {
    const storedEmployees = getStoredEmployees();
    console.log('Fetched employees:', storedEmployees);
    
    // Log employee roles for debugging
    if (storedEmployees && storedEmployees.length > 0) {
      storedEmployees.forEach(emp => {
        console.log(`Employee ${emp.firstName} ${emp.lastName} (ID: ${emp.id}) - Role:`, emp.role, 'RoleName:', emp.roleName);
      });
    }
    
    setEmployees(storedEmployees || []);
  };

  // Helper function to get employee's current role
  const getEmployeeCurrentRole = (employee) => {
    if (!employee) return { roleId: '', roleName: 'No role assigned' };
    
    console.log('Getting current role for employee:', employee);
    console.log('Available roles:', roles);
    
    let roleId = '';
    let roleName = 'No role assigned';
    
    // First try to get role directly from roleName property (most reliable)
    if (employee.roleName) {
      roleName = employee.roleName;
      console.log('Found roleName property:', roleName);
      
      // Try to find the matching role ID
      if (roles && roles.length > 0) {
        const matchingRole = roles.find(r => r.name === employee.roleName);
        if (matchingRole) {
          roleId = matchingRole.id;
          console.log('Found role ID from name:', roleId);
        }
      }
    }
    
    // If we still don't have a roleId, check the role property
    if (!roleId && employee.role) {
      console.log('Checking role property:', employee.role, 'Type:', typeof employee.role);
      
      if (typeof employee.role === 'string') {
        // If role is stored as ID string
        roleId = employee.role;
        console.log('Role is string ID:', roleId);
        
        // Find the role name from the ID if we don't have it yet
        if (roleName === 'No role assigned' && roles && roles.length > 0) {
          const role = roles.find(r => r.id && r.id.toString() === employee.role.toString());
          if (role) {
            roleName = role.name;
            console.log('Found role name from ID:', roleName);
          }
        }
      } else if (typeof employee.role === 'object' && employee.role !== null) {
        // If role is stored as an object
        if (employee.role.id) {
          roleId = employee.role.id;
          if (!roleName || roleName === 'No role assigned') {
            roleName = employee.role.name || 'Unknown Role';
          }
          console.log('Role is object with ID:', roleId, 'and name:', roleName);
        }
      }
    }
    
    console.log('Final role detection result:', { roleId, roleName });
    return { roleId, roleName };
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoleLogs = roleLogs.filter((log) => {
    const employee = employees.find(emp => emp.id?.toString() === log.employeeId?.toString());
    const employeeName = employee 
      ? `${employee.firstName} ${employee.lastName}`.toLowerCase() 
      : '';
    
    return (
      employeeName.includes(searchTerm.toLowerCase()) ||
      (log.oldRoleName && log.oldRoleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.newRoleName && log.newRoleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenDialog = () => {
    console.log("Log Role Change button clicked, opening dialog directly");
    
    // Reset form data
    setFormData({
      employeeId: '',
      oldRoleId: '',
      oldRoleName: '',
      newRoleId: '',
      newRoleName: '',
      changeDate: new Date().toISOString().substr(0, 10),
      changedBy: 'admin',
      reason: ''
    });
    
    // Open dialog immediately
    setDialogOpen(true);
    
    // Fetch roles in the background
    fetchRoles().then(fetchedRoles => {
      console.log("Roles fetched successfully:", fetchedRoles);
    }).catch(error => {
      console.error("Error fetching roles:", error);
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeId') {
      const employee = employees.find(emp => emp.id.toString() === value.toString());
      if (employee) {
        // Get current role information
        const { roleId, roleName } = getEmployeeCurrentRole(employee);
        
        console.log('Employee selected:', employee);
        console.log('Current role detected:', { roleId, roleName });
        
        setFormData(prev => ({
          ...prev,
          employeeId: value,
          oldRoleId: roleId,
          oldRoleName: roleName
        }));
      }
    } else if (name === 'newRoleId') {
      // When new role is selected, also store the role name
      const selectedRole = roles.find(r => r.id && r.id.toString() === value.toString());
      
      if (selectedRole) {
        console.log('New role selected:', selectedRole);
        
        setFormData(prev => ({
          ...prev,
          newRoleId: value,
          newRoleName: selectedRole.name
        }));
      } else {
        console.warn('Could not find role with ID:', value);
        console.log('Available roles:', roles);
        
        setFormData(prev => ({
          ...prev,
          newRoleId: value,
          newRoleName: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.employeeId || !formData.newRoleId || !formData.reason) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
      return;
    }

    const newLog = {
      id: Date.now(),
        employeeId: formData.employeeId,
        oldRoleId: formData.oldRoleId,
        oldRoleName: formData.oldRoleName,
        newRoleId: formData.newRoleId,
        newRoleName: formData.newRoleName,
        changeDate: formData.changeDate,
        changedBy: formData.changedBy,
        reason: formData.reason,
        timestamp: new Date().toISOString()
      };

      console.log('Saving new role log:', newLog);

      // Try to save via API
      try {
        const response = await axios.post(`${API_BASE_URL}/api/role-logs`, newLog);
        const savedLog = response.data;
        
        setRoleLogs(prev => [...prev, savedLog]);
        saveRoleLogsToLocalStorage([...roleLogs, savedLog]);
        
        // Also update the employee's role
        const employee = employees.find(emp => emp.id.toString() === formData.employeeId.toString());
        if (employee) {
          console.log('Updating employee role:', employee);
          
          // Update both role ID and role name
          employee.role = formData.newRoleId;
          employee.roleName = formData.newRoleName;
          employee.updatedAt = new Date().toISOString();
          
          console.log('Updated employee:', employee);
          
          // Save the employee data
          const updatedEmployees = employees.map(emp => 
            emp.id.toString() === employee.id.toString() ? employee : emp
          );
          
          // Update both regular and compressed storage
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
          try {
            const storeCompressedEmployees = window.storeCompressedEmployees || (() => {});
            storeCompressedEmployees(updatedEmployees);
          } catch (err) {
            console.warn('Could not update compressed storage:', err);
          }
          
          // Update the local state
          setEmployees(updatedEmployees);
        }
        
        setSnackbar({
          open: true,
          message: 'Role change logged successfully',
          severity: 'success'
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Save locally
        setRoleLogs(prev => [...prev, newLog]);
        saveRoleLogsToLocalStorage([...roleLogs, newLog]);
        
        // Update the employee role locally
        const employee = employees.find(emp => emp.id.toString() === formData.employeeId.toString());
        if (employee) {
          console.log('Updating employee role (localStorage fallback):', employee);
          
          // Update both role ID and role name
          employee.role = formData.newRoleId;
          employee.roleName = formData.newRoleName;
          employee.updatedAt = new Date().toISOString();
          
          console.log('Updated employee:', employee);
          
          // Save employee data
          const updatedEmployees = employees.map(emp => 
            emp.id.toString() === employee.id.toString() ? employee : emp
          );
          
          // Update both regular and compressed storage
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
          try {
            const storeCompressedEmployees = window.storeCompressedEmployees || (() => {});
            storeCompressedEmployees(updatedEmployees);
          } catch (err) {
            console.warn('Could not update compressed storage:', err);
          }
          
          // Update the local state
          setEmployees(updatedEmployees);
        }
        
        setSnackbar({
          open: true,
          message: 'Role change logged locally. API connection failed.',
          severity: 'warning'
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving role log:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save role change log',
        severity: 'error'
      });
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id?.toString() === employeeId?.toString());
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id?.toString() === roleId?.toString());
    return role ? role.name : 'Unknown Role';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'employeeId', 
      headerName: 'Employee', 
      width: 200,
      valueGetter: (params) => getEmployeeName(params.row.employeeId)
    },
    { 
      field: 'oldRoleName', 
      headerName: 'Previous Role', 
      width: 150,
      valueGetter: (params) => params.row.oldRoleName || getRoleName(params.row.oldRoleId) || 'No role'
    },
    { 
      field: 'newRoleName', 
      headerName: 'New Role', 
      width: 150,
      valueGetter: (params) => params.row.newRoleName || getRoleName(params.row.newRoleId) || 'Unknown'
    },
    { 
      field: 'changeDate', 
      headerName: 'Change Date', 
      width: 150,
      valueGetter: (params) => {
        if (!params.row.changeDate) return '';
        return new Date(params.row.changeDate).toLocaleDateString();
      }
    },
    { field: 'changedBy', headerName: 'Changed By', width: 150 },
    { field: 'reason', headerName: 'Reason', width: 250 },
  ];

  // Function to migrate old role logs to new format if needed
  const migrateRoleLogs = (logs) => {
    return logs.map(log => {
      // If the log already has the new format, return it as is
      if (log.oldRoleId !== undefined && log.newRoleId !== undefined) {
        return log;
      }
      
      // Otherwise, migrate the old format to the new format
      const oldRoleName = log.oldRole || '';
      const newRoleName = log.newRole || '';
      
      // Try to find role IDs based on names
      let oldRoleId = '';
      let newRoleId = '';
      
      if (oldRoleName) {
        const oldRole = roles.find(r => r.name === oldRoleName);
        if (oldRole) oldRoleId = oldRole.id;
      }
      
      if (newRoleName) {
        const newRole = roles.find(r => r.name === newRoleName);
        if (newRole) newRoleId = newRole.id;
      }
      
      return {
        ...log,
        oldRoleId,
        oldRoleName,
        newRoleId,
        newRoleName
      };
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="#008000">Role Change Logs</Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
            <TextField
              fullWidth
            variant="outlined"
            placeholder="Search by employee name, role or reason..."
            value={searchTerm}
            onChange={handleSearchChange}
              InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              }}
            />
          </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleOpenDialog}
            sx={{ 
              bgcolor: '#008000',
              '&:hover': {
                bgcolor: '#006400'
              }
            }}
          >
            Log Role Change
          </Button>
        </Grid>
          </Grid>
      
      <Paper sx={{ height: 600, width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={filteredRoleLogs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#E9F7FB', fontWeight: 'bold', color: '#005F2F' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 128, 0, 0.05)' },
            fontSize: 15,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#f9f9f9',
              borderTop: '1px solid #e0e0e0',
            }
          }}
        />
      </Paper>
      
      {/* Role Change Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{ 
          zIndex: 1400,
          '& .MuiDialog-paper': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#E9F7FB', color: '#005F2F', fontWeight: 'bold' }}>
          Log Role Change
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select
                name="employeeId"
                  value={formData.employeeId}
                label="Employee"
                  onChange={handleFormChange}
                >
                  {employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="changeDate"
                label="Change Date"
                type="date"
                fullWidth
                value={formData.changeDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="oldRoleName"
                label="Previous Role"
                fullWidth
                value={formData.oldRoleName}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>New Role</InputLabel>
              <Select
                  name="newRoleId"
                  value={formData.newRoleId}
                label="New Role"
                  onChange={handleFormChange}
                >
                  {roles && roles.length > 0 ? (
                    roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No roles available
                    </MenuItem>
                  )}
              </Select>
            </FormControl>
            </Grid>
            
            <Grid item xs={12}>
            <TextField
                name="reason"
                label="Reason for Change"
                fullWidth
                multiline
                rows={3}
                value={formData.reason}
                onChange={handleFormChange}
              required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="contained" color="info">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#008000' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleLog;

