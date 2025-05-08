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
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { PermissionService } from '../../services/apiService';
import { mockPermissions } from '../../config/mockData';

const initialForm = { name: '', description: '' };

const getRows = (permissions) => permissions.map((perm, idx) => ({
  id: perm.id || `temp-${idx}`,
  srNo: idx + 1,
  name: perm.name,
  description: perm.description
}));

const Permissions = ({ onPermissionsChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [permissions, setPermissions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const fetchedPermissions = await PermissionService.getPermissions();
      setPermissions(fetchedPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch permissions.', 
        severity: 'error' 
      });
    }
  };

  React.useEffect(() => {
    if (onPermissionsChange) {
      onPermissionsChange(permissions);
    }
  }, [permissions, onPermissionsChange]);

  const columns = [
    { field: 'srNo', headerName: 'Sr No', width: 80 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 320 },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      renderCell: (params) => {
        const perm = permissions.find(p => p.id === params.row.id);
        return (
          <>
            <Button size="small" color="primary" style={{ marginRight: 8 }} onClick={() => handleEdit(perm)}>Edit</Button>
            <Button size="small" color="error" onClick={() => handleDelete(perm.id)}>Delete</Button>
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

  const handleAddPermission = async () => {
    if (!form.name) {
      setSnackbar({ open: true, message: 'Permission name is required.', severity: 'error' });
      return;
    }
    try {
      const newPermission = await PermissionService.createPermission(form);
      setPermissions(prevPermissions => [...prevPermissions, newPermission]);
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Permission added successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error adding permission:', error);
      setSnackbar({ open: true, message: 'Failed to add permission.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await PermissionService.deletePermission(id);
      setPermissions(prevPermissions => prevPermissions.filter(permission => permission.id !== id));
      setSnackbar({ open: true, message: 'Permission deleted.', severity: 'info' });
    } catch (error) {
      console.error('Error deleting permission:', error);
      setSnackbar({ open: true, message: 'Failed to delete permission.', severity: 'error' });
    }
  };

  const handleEdit = async (permission) => {
    setForm(permission);
    setOpenDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPermission = await PermissionService.updatePermission(form.id, form);
      setPermissions(prevPermissions => prevPermissions.map(p => (p.id === form.id ? updatedPermission : p)));
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Permission updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error updating permission:', error);
      setSnackbar({ open: true, message: 'Failed to update permission.', severity: 'error' });
    }
  };

  // Add function to reset data with mock data
  const handleResetData = () => {
    try {
      // Set the mock permissions into localStorage
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));
      
      // Reload the permissions
      setPermissions(mockPermissions);
      
      setSnackbar({ 
        open: true, 
        message: 'Permission data has been reset to initial demo data.', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Failed to reset permission data:', err);
      setSnackbar({ 
        open: true, 
        message: 'Failed to reset permission data.', 
        severity: 'error' 
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Permissions</Typography>
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
            Add New Permission
          </Button>
        </Box>
      </Box>
      <Paper sx={{ height: 450, width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={getRows(permissions)}
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
            }
          }}
        />
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{form.id ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              name="name"
              label="Permission Name"
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
            onClick={form.id ? handleSaveEdit : handleAddPermission} 
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

Permissions.propTypes = {
  onPermissionsChange: PropTypes.func
};

export default Permissions;
