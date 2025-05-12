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
import CircularProgress from '@mui/material/CircularProgress';
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

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // returns true if token exists, false otherwise
};

const RoleLog = () => {
  const [roleLogs, setRoleLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    oldRoleId: '',
    oldRoleName: '',
    newRoleId: '',
    newRoleName: '',
    changeDate: new Date().toISOString().substr(0, 10),
    changedBy: localStorage.getItem('username') || 'admin',
    reason: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load data on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      try {
        console.log("Loading initial data for RoleLog component");
        // Load roles first since they're needed for other operations
        const fetchedRoles = await fetchRoles();
        console.log("Initial roles loaded:", fetchedRoles);
        
        // Then load employees and role logs in parallel
        await Promise.all([
          fetchEmployees(),
          fetchRoleLogs()
        ]);
      } catch (error) {
        console.error("Error during initial data loading:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setSnackbar({
            open: true,
            message: 'Error loading data. Some features may be limited.',
            severity: 'warning'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchRoleLogs = async () => {
    if (!isAuthenticated()) {
      const localRoleLogs = getRoleLogsFromLocalStorage();
      setRoleLogs(migrateRoleLogs(localRoleLogs));
      return localRoleLogs;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/role-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        const logs = Array.isArray(response.data) ? response.data : [];
        setRoleLogs(migrateRoleLogs(logs));
        saveRoleLogsToLocalStorage(migrateRoleLogs(logs));
        return logs;
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else {
        throw new Error('Failed to fetch role logs');
      }
    } catch (error) {
      console.error('Error fetching role logs:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Fallback to localStorage
      const localRoleLogs = getRoleLogsFromLocalStorage();
      setRoleLogs(migrateRoleLogs(localRoleLogs));
      return localRoleLogs;
    }
  };

  const fetchRoles = async () => {
    if (!isAuthenticated()) {
      const localRoles = getRolesFromLocalStorage();
      setRoles(localRoles);
      return localRoles;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        const rolesData = Array.isArray(response.data) ? response.data : [];
        setRoles(rolesData);
        return rolesData;
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else {
        throw new Error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Fallback to local storage
      const localRoles = getRolesFromLocalStorage();
      setRoles(localRoles);
      return localRoles;
    }
  };

  const fetchEmployees = async () => {
    // First try to get from local storage
    const localEmployees = getStoredEmployees();
    if (!isAuthenticated()) {
      setEmployees(localEmployees);
      return localEmployees;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        const employeesData = Array.isArray(response.data?.data) ? response.data.data : [];
        setEmployees(employeesData);
        return employeesData;
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        // Use local data as fallback
        setEmployees(localEmployees);
        return localEmployees;
      }
      return [];
    }
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

  const handleOpenDialog = async () => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      // Refresh data when opening dialog
      await Promise.all([
        fetchRoles(),
        fetchEmployees()
      ]);
      
      setFormData(prev => ({
        ...prev,
        employeeId: '',
        oldRoleId: '',
        oldRoleName: '',
        newRoleId: '',
        newRoleName: '',
        changeDate: new Date().toISOString().substr(0, 10),
        changedBy: localStorage.getItem('username') || 'admin',
        reason: ''
      }));
      
      setDialogOpen(true);
    } catch (error) {
      console.error("Error loading dialog data:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load required data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

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
    { field: 'reason', headerName: 'Reason', width: 200 }
  ];

  const migrateRoleLogs = (logs) => {
    if (!logs || logs.length === 0) {
      console.log('No role logs to migrate');
      return [];
    }
  
    console.log('Migrating role logs:', logs);
  
    return logs.map(log => {
      // Ensure employeeId is always a string
      const employeeId = log.employeeId ? String(log.employeeId) : '';
  
      // Ensure other fields exist
      return {
        ...log,
        employeeId: employeeId,
        oldRoleId: log.oldRoleId || '',
        oldRoleName: log.oldRoleName || '',
        newRoleId: log.newRoleId || '',
        newRoleName: log.newRoleName || '',
        changeDate: log.changeDate || '',
        changedBy: log.changedBy || '',
        reason: log.reason || ''
      };
    });
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role Change Logs
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Search Employee or Role"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenDialog}
            disabled={!isAuthenticated()}
          >
            Log Role Change
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRoleLogs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={(row) => row.id}
          sx={{
            '& .MuiDataGrid-footerContainer': {
              justifyContent: 'center',
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Log Role Change</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="employee-label">Employee</InputLabel>
                <Select
                  labelId="employee-label"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  label="Employee"
                  onChange={handleFormChange}
                  disabled={loading}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Previous Role"
                value={formData.oldRoleName}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="new-role-label">New Role</InputLabel>
                <Select
                  labelId="new-role-label"
                  id="newRoleId"
                  name="newRoleId"
                  value={formData.newRoleId}
                  label="New Role"
                  onChange={handleFormChange}
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Change Date"
                type="date"
                name="changeDate"
                value={formData.changeDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Changed By"
                name="changedBy"
                value={formData.changedBy}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleFormChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleLog;
