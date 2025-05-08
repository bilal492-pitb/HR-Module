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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PostService } from '../../services/apiService';
import { mockPosts } from '../../config/mockData';

const grades = Array.from({ length: 13 }, (_, i) => i + 1);
const dummyDepartments = [
  'Food',
  'Agriculture',
  'Drug',
  'Admin',
  'HR',
  'Finance',
  'IT',
  'Other'
];

const initialForm = {
  name: '',
  numberOfPositions: '',
  grade: '',
  department: '',
  position: ''
};

const getRows = (posts) => posts.map((post, idx) => ({
  id: post.id || `temp-${idx}`,
  srNo: idx + 1,
  name: post.name,
  numberOfPositions: post.numberOfPositions,
  filled: post.filled || 0,
  vacant: post.vacant || post.numberOfPositions,
  grade: post.grade,
  position: post.position
}));

const Posts = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({ grade: '', department: '' });
  const departments = dummyDepartments;

  // Define columns inside the component so it can access component methods
  const columns = [
    { field: 'srNo', headerName: 'Sr No', width: 80 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'numberOfPositions', headerName: 'Sanctioned Post', width: 150 },
    { field: 'filled', headerName: 'Filled Post', width: 120 },
    { field: 'vacant', headerName: 'Vacant Post', width: 120 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'position', headerName: 'Place Posting', width: 160 },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      renderCell: (params) => {
        const post = params.row;
        return (
          <>
            <Button size="small" color="primary" style={{ marginRight: 8 }} onClick={() => handleEditPost(post)}>Edit</Button>
            <Button size="small" color="error" onClick={() => handleDeletePost(post.id)}>Delete</Button>
          </>
        );
      },
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    }
  ];

  useEffect(() => {
    // Fetch posts on mount
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await PostService.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch posts.', 
        severity: 'error' 
      });
    }
  };

  const handleOpenDialog = () => {
    setForm(initialForm);
    setEditingPostId(null);
    setOpenDialog(true);
  };

  const handleEditPost = (post) => {
    // Create a copy of the post for editing
    setForm({
      name: post.name,
      numberOfPositions: post.numberOfPositions,
      grade: post.grade,
      department: post.department,
      position: post.position
    });
    setEditingPostId(post.id);
    setOpenDialog(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await PostService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setSnackbar({ open: true, message: 'Post deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({ open: true, message: 'Failed to delete post.', severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddPost = async () => {
    if (!form.name || !form.numberOfPositions || !form.grade || !form.department) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }

    try {
      if (editingPostId) {
        // Update existing post
        const updatedPost = await PostService.updatePost(editingPostId, {
          ...form,
          numberOfPositions: Number(form.numberOfPositions)
        });
        
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === editingPostId ? updatedPost : post
        ));
        
        setOpenDialog(false);
        setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
      } else {
        // Create new post
        const newPost = await PostService.createPost({
          ...form,
          numberOfPositions: Number(form.numberOfPositions),
          filled: 0,
          vacant: Number(form.numberOfPositions)
        });
        
        setPosts(prevPosts => [...prevPosts, newPost]);
        setOpenDialog(false);
        setSnackbar({ open: true, message: 'Post added successfully!', severity: 'success' });
      }
    } catch (error) {
      console.error('Error in post operation:', error);
      setSnackbar({ open: true, message: 'Failed to save post. Please try again.', severity: 'error' });
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Add function to reset data with mock data
  const handleResetData = () => {
    try {
      // Set the mock posts into localStorage
      localStorage.setItem('posts', JSON.stringify(mockPosts));
      
      // Reload the posts
      setPosts(mockPosts);
      
      setSnackbar({ 
        open: true, 
        message: 'Post data has been reset to initial demo data.', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Failed to reset post data:', err);
      setSnackbar({ 
        open: true, 
        message: 'Failed to reset post data.', 
        severity: 'error' 
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    return (
      (!filters.grade || post.grade === filters.grade) &&
      (!filters.department || post.department === filters.department)
    );
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Posts</Typography>
      <Box mb={2} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Grade</InputLabel>
          <Select
            name="grade"
            value={filters.grade}
            label="Grade"
            onChange={handleFilterChange}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {grades.map(g => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={filters.department}
            label="Department"
            onChange={handleFilterChange}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {departments.map(dep => (
              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="outlined" 
          color="secondary" 
          sx={{ mr: 2 }} 
          onClick={handleResetData}
        >
          Reset Demo Data
        </Button>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Add New Post
        </Button>
      </Box>
      <Paper sx={{ height: 450, width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={getRows(filteredPosts)}
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
        <DialogTitle>{editingPostId ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              name="name"
              label="Name of Post"
              value={form.name}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              name="numberOfPositions"
              label="Number of Positions"
              type="number"
              value={form.numberOfPositions}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Select
                name="grade"
                value={form.grade}
                label="Grade"
                onChange={handleFormChange}
              >
                {grades.map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={form.department}
                label="Department"
                onChange={handleFormChange}
              >
                {departments.map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="position"
              label="Place Posting"
              value={form.position}
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
            onClick={handleAddPost} 
            variant="contained" 
            color="success"
          >
            {editingPostId ? 'Save' : 'Add'}
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

export default Posts;
