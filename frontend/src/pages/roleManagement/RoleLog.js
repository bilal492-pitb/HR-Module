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
    return roles ? JSON.parse(roles) : [];
  } catch (error) {
    console.error('Error getting roles from localStorage:', error);
    return [];
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
    oldRole: '',
    newRole: '',
    changeDate: new Date().toISOString().substr(0, 10), // Today's date
    changedBy: 'admin', // Default value
    reason: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRoleLogs();
    fetchRoles();
    fetchEmployees();
  }, []);

  const fetchRoleLogs = async () => {
    try {
      // Try API first
      const response = await axios.get(`${API_BASE_URL}/api/role-logs`);
      const data = response.data;
      setRoleLogs(data);
      saveRoleLogsToLocalStorage(data);
    } catch (error) {
      console.error('Error fetching role logs from API:', error);
      
      // Fallback to localStorage
      const localRoleLogs = getRoleLogsFromLocalStorage();
      setRoleLogs(localRoleLogs);
    }
  };

  const fetchRoles = async () => {
    try {
      // Try API first
      const response = await axios.get(`${API_BASE_URL}/api/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles from API:', error);
      
      // Fallback to localStorage
      const localRoles = getRolesFromLocalStorage();
      setRoles(localRoles);
    }
  };

  const fetchEmployees = () => {
    const storedEmployees = getStoredEmployees();
    setEmployees(storedEmployees || []);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoleLogs = roleLogs.filter((log) => {
    const employee = employees.find(emp => emp.id.toString() === log.employeeId?.toString());
    const employeeName = employee 
      ? `${employee.firstName} ${employee.lastName}`.toLowerCase() 
      : '';
    
    return (
      employeeName.includes(searchTerm.toLowerCase()) ||
      (log.oldRole && log.oldRole.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.newRole && log.newRole.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenDialog = () => {
    setFormData({
      employeeId: '',
      oldRole: '',
      newRole: '',
      changeDate: new Date().toISOString().substr(0, 10),
      changedBy: 'admin',
      reason: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If employee is selected, auto-fill the old role
    if (name === 'employeeId') {
      const employee = employees.find(emp => emp.id.toString() === value.toString());
      if (employee && employee.role) {
        setFormData(prev => ({
          ...prev,
          employeeId: value,
          oldRole: employee.role
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.employeeId || !formData.newRole || !formData.reason) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }

      const newLog = {
        id: Date.now(),
        ...formData,
        timestamp: new Date().toISOString()
      };

      // Try to save via API
      try {
        const response = await axios.post(`${API_BASE_URL}/api/role-logs`, newLog);
        const savedLog = response.data;
        
        setRoleLogs(prev => [...prev, savedLog]);
        saveRoleLogsToLocalStorage([...roleLogs, savedLog]);
        
        // Also update the employee's role
        const employee = employees.find(emp => emp.id.toString() === formData.employeeId.toString());
        if (employee) {
          employee.role = formData.newRole;
          employee.updatedAt = new Date().toISOString();
          
          // Save the employee data
          const updatedEmployees = employees.map(emp => 
            emp.id.toString() === employee.id.toString() ? employee : emp
          );
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
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
          employee.role = formData.newRole;
          employee.updatedAt = new Date().toISOString();
          
          // Save employee data
          const updatedEmployees = employees.map(emp => 
            emp.id.toString() === employee.id.toString() ? employee : emp
          );
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'employeeId', 
      headerName: 'Employee', 
      width: 200,
      valueGetter: (params) => getEmployeeName(params.row.employeeId)
    },
    { field: 'oldRole', headerName: 'Previous Role', width: 150 },
    { field: 'newRole', headerName: 'New Role', width: 150 },
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
            sx={{ bgcolor: '#008000' }}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#E9F7FB', color: '#005F2F' }}>Log Role Change</DialogTitle>
        <DialogContent>
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
                name="oldRole"
                label="Previous Role"
                fullWidth
                value={formData.oldRole}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>New Role</InputLabel>
                <Select
                  name="newRole"
                  value={formData.newRole}
                  label="New Role"
                  onChange={handleFormChange}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
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
