import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { RoleService, PermissionService } from '../../services/apiService';
import { mockRoles } from '../../config/mockData';

const initialForm = { name: '', description: '', permissionIds: [] };

// Get rows function to map roles to grid rows
const getRows = (roles, permissions) => roles.map((role, idx) => {
  // Handle both permissionIds and permissions (for backward compatibility)
  const permissionIds = role.permissionIds || 
    (role.permissions ? role.permissions.map(p => {
      // If it's a string name, find the corresponding ID
      if (typeof p === 'string') {
        const found = permissions.find(perm => perm.name === p);
        return found ? found.id : null;
      }
      return p;
    }).filter(id => id !== null) : []);
    
  return {
    id: role.id || `temp-${idx}`,
    srNo: idx + 1,
    name: role.name,
    description: role.description,
    permissions: permissions
      .filter(p => permissionIds.includes(p.id))
      .map(p => p.name)
      .join(', ')
  };
});

const Roles = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [roles, setRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const fetchedPermissions = await PermissionService.getPermissions();
      setPermissions(fetchedPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setSnackbar({ open: true, message: 'Failed to fetch permissions', severity: 'error' });
    }
  };

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await RoleService.getRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setSnackbar({ open: true, message: 'Failed to fetch roles', severity: 'error' });
    }
  };

  const columns = [
    { field: 'srNo', headerName: 'Sr No', width: 80 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'description', headerName: 'Description', width: 260 },
    { field: 'permissions', headerName: 'Permissions', width: 260 },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      renderCell: (params) => {
        const role = roles.find(r => r.id === params.row.id);
        return (
          <>
            <Button size="small" color="primary" style={{ marginRight: 8 }} onClick={() => handleEdit(role)}>Edit</Button>
            <Button size="small" color="error" onClick={() => handleDelete(role.id)}>Delete</Button>
          </>
        );
      },
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    }
  ];

  const handleOpenDialog = () => {
    setForm(initialForm);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (id) => {
    setForm((prev) => {
      const exists = prev.permissionIds && prev.permissionIds.includes(id);
      return {
        ...prev,
        permissionIds: exists ? prev.permissionIds.filter(pid => pid !== id) : [...(prev.permissionIds || []), id]
      };
    });
  };

  const handleAddRole = async () => {
    if (!form.name) {
      setSnackbar({ open: true, message: 'Role name is required.', severity: 'error' });
      return;
    }
    
    try {
      const newRole = await RoleService.createRole({
        name: form.name,
        description: form.description,
        permissionIds: form.permissionIds || []
      });
      
      setRoles(prevRoles => [...prevRoles, newRole]);
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Role added successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error adding role:', error);
      setSnackbar({ open: true, message: 'Failed to add role', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await RoleService.deleteRole(id);
      setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
      setSnackbar({ open: true, message: 'Role deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting role:', error);
      setSnackbar({ open: true, message: 'Failed to delete role', severity: 'error' });
    }
  };

  const handleEdit = (role) => {
    // Make sure permissionIds is always an array
    const roleToEdit = {
      ...role,
      permissionIds: role.permissionIds || []
    };
    setForm(roleToEdit);
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedRole = await RoleService.updateRole(form.id, {
        name: form.name,
        description: form.description,
        permissionIds: form.permissionIds || []
      });
      
      setRoles(prevRoles => prevRoles.map(role => role.id === form.id ? updatedRole : role));
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Role updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error updating role:', error);
      setSnackbar({ open: true, message: 'Failed to update role', severity: 'error' });
    }
  };

  // Add function to reset data with mock data
  const handleResetData = () => {
    try {
      // Set the mock roles into localStorage
      localStorage.setItem('roles', JSON.stringify(mockRoles));
      
      // Reload the roles
      setRoles(mockRoles);
      
      setSnackbar({ 
        open: true, 
        message: 'Role data has been reset to initial demo data.', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Failed to reset role data:', err);
      setSnackbar({ 
        open: true, 
        message: 'Failed to reset role data.', 
        severity: 'error' 
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Roles</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary" 
            sx={{ mr: 2 }} 
            onClick={handleResetData}
          >
            Reset Demo Data
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Add New Role
          </Button>
        </Box>
      </Box>
      <Paper sx={{ height: 450, width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={getRows(roles, permissions)}
          columns={columns}
          pageSize={6}
          rowsPerPageOptions={[6, 12, 24]}
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#E9F7FB', fontWeight: 'bold', color: '#005F2F' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(191, 234, 124, 0.1)' },
            fontSize: 15,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#f9f9f9',
              borderTop: '1px solid #e0e0e0',
            },
            '& .MuiButton-root': {
              color: '#005F2F',
            },
            '& .MuiCheckbox-root.Mui-checked': {
              color: '#005F2F',
            }
          }}
        />
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{form.id ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              name="name"
              label="Role Name"
              value={form.name}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={form.description}
              onChange={handleFormChange}
              fullWidth
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Assign Permissions</Typography>
            <FormGroup>
              {permissions.map((perm) => (
                <FormControlLabel
                  key={perm.id}
                  control={
                    <Checkbox
                      checked={form.permissionIds && form.permissionIds.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                      sx={{
                        '&.Mui-checked': {
                          color: '#005F2F',
                        }
                      }}
                    />
                  }
                  label={perm.name}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained" 
            color="info"
          >
            Cancel
          </Button>
          <Button 
            onClick={form.id ? handleSaveEdit : handleAddRole} 
            variant="contained" 
            color="success"
          >
            {form.id ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Roles;
