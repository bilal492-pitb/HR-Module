import axios from 'axios';
import mockApiService from '../config/mockData';
import { API_BASE_URL } from '../config/api';
import { mockRoles, mockPermissions, mockPosts } from '../config/mockData';

// Generic handler that attempts API call first but falls back to mock/local data
const handleRequest = (apiCall, mockCall) => async (...args) => {
  try {
    // Check if we're in demo mode
    const isDemoMode = localStorage.getItem('apiMode') === 'demo';
    
    if (isDemoMode) {
      // In demo mode, always use mock data
      return await mockCall(...args);
    }
    
    // Try the real API call
    return await apiCall(...args);
  } catch (error) {
    console.error('API call failed, falling back to mock data:', error);
    // Fall back to mock data if API call fails
    return await mockCall(...args);
  }
};

// Function to initialize demo data if it doesn't exist already
export const initializeDemoDataIfNeeded = () => {
  // Check if we're in demo mode or if the data is missing
  const isDemoMode = localStorage.getItem('apiMode') === 'demo';
  const hasRoles = localStorage.getItem('roles') && JSON.parse(localStorage.getItem('roles')).length > 0;
  const hasPermissions = localStorage.getItem('permissions') && JSON.parse(localStorage.getItem('permissions')).length > 0;
  const hasPosts = localStorage.getItem('posts') && JSON.parse(localStorage.getItem('posts')).length > 0;
  
  if (isDemoMode || !hasRoles || !hasPermissions || !hasPosts) {
    // Set demo mode
    localStorage.setItem('apiMode', 'demo');
    
    // Initialize data if missing
    if (!hasRoles) {
      localStorage.setItem('roles', JSON.stringify(mockRoles));
      console.log('Initialized roles data in localStorage');
    }
    
    if (!hasPermissions) {
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));
      console.log('Initialized permissions data in localStorage');
    }
    
    if (!hasPosts) {
      localStorage.setItem('posts', JSON.stringify(mockPosts));
      console.log('Initialized posts data in localStorage');
    }
    
    return true; // Data was initialized
  }
  
  return false; // No initialization needed
};

// Employee services
export const EmployeeService = {
  getEmployees: handleRequest(
    async () => {
      const response = await axios.get('/api/employees');
      return response;
    },
    mockApiService.getEmployees
  ),
  
  // Get employee by ID
  getEmployee: handleRequest(
    async (id) => {
      const response = await axios.get(`/api/employees/${id}`);
      return response;
    },
    mockApiService.getEmployee
  ),
  
  // Create new employee
  createEmployee: handleRequest(
    async (employeeData) => {
      const response = await axios.post('/api/employees', employeeData);
      return response;
    },
    mockApiService.createEmployee
  ),
  
  // Update employee
  updateEmployee: handleRequest(
    async (id, employeeData) => {
      const response = await axios.put(`/api/employees/${id}`, employeeData);
      return response;
    },
    mockApiService.updateEmployee
  ),
  
  // Delete employee
  deleteEmployee: handleRequest(
    async (id) => {
      const response = await axios.delete(`/api/employees/${id}`);
      return response;
    },
    mockApiService.deleteEmployee
  )
};

// Role services with improved error handling
const roleService = {
  // Get all roles
  getRoles: handleRequest(
    async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/roles`);
        return response;
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Try to get local roles if API fails
        const localRoles = localStorage.getItem('roles');
        if (localRoles) {
          return { data: JSON.parse(localRoles) };
        }
        throw error;
      }
    },
    mockApiService.getRoles
  ),
  
  // Get role by ID
  getRole: handleRequest(
    async (id) => {
      const response = await axios.get(`/api/roles/${id}`);
      return response;
    },
    mockApiService.getRole
  ),
  
  // Create new role
  createRole: handleRequest(
    async (roleData) => {
      const response = await axios.post('/api/roles', roleData);
      return response;
    },
    mockApiService.createRole
  ),
  
  // Update role
  updateRole: handleRequest(
    async (id, roleData) => {
      const response = await axios.put(`/api/roles/${id}`, roleData);
      return response;
    },
    mockApiService.updateRole
  ),
  
  // Delete role
  deleteRole: handleRequest(
    async (id) => {
      const response = await axios.delete(`/api/roles/${id}`);
      return response;
    },
    mockApiService.deleteRole
  ),

  // Mock implementations that use localStorage
  mock: {
    getRoles: async () => {
      try {
        const roles = localStorage.getItem('roles');
        return roles ? JSON.parse(roles) : [];
      } catch (error) {
        console.error('Error retrieving roles from localStorage:', error);
        return [];
      }
    },
    
    createRole: async (roleData) => {
      try {
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        const newRole = {
          ...roleData,
          id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
          createdAt: new Date().toISOString()
        };
        
        roles.push(newRole);
        localStorage.setItem('roles', JSON.stringify(roles));
        return newRole;
      } catch (error) {
        console.error('Error creating role in localStorage:', error);
        throw error;
      }
    },
    
    updateRole: async (id, roleData) => {
      try {
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        const index = roles.findIndex(r => r.id === parseInt(id));
        
        if (index === -1) throw new Error('Role not found');
        
        roles[index] = { ...roles[index], ...roleData };
        localStorage.setItem('roles', JSON.stringify(roles));
        return roles[index];
      } catch (error) {
        console.error('Error updating role in localStorage:', error);
        throw error;
      }
    },
    
    deleteRole: async (id) => {
      try {
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        const filteredRoles = roles.filter(r => r.id !== parseInt(id));
        
        localStorage.setItem('roles', JSON.stringify(filteredRoles));
        return { success: true };
      } catch (error) {
        console.error('Error deleting role from localStorage:', error);
        throw error;
      }
    }
  }
};

// Permission services with improved error handling
const permissionService = {
  // Get all permissions
  getPermissions: handleRequest(
    async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/permissions`);
        return response;
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Try to get local permissions if API fails
        const localPermissions = localStorage.getItem('permissions');
        if (localPermissions) {
          return { data: JSON.parse(localPermissions) };
        }
        throw error;
      }
    },
    mockApiService.getPermissions
  ),

  // Mock implementations that use localStorage
  mock: {
    getPermissions: async () => {
      try {
        const permissions = localStorage.getItem('permissions');
        return permissions ? JSON.parse(permissions) : [];
      } catch (error) {
        console.error('Error retrieving permissions from localStorage:', error);
        return [];
      }
    },
    
    createPermission: async (permissionData) => {
      try {
        const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        const newPermission = {
          ...permissionData,
          id: permissions.length > 0 ? Math.max(...permissions.map(p => p.id)) + 1 : 1,
          createdAt: new Date().toISOString()
        };
        
        permissions.push(newPermission);
        localStorage.setItem('permissions', JSON.stringify(permissions));
        return newPermission;
      } catch (error) {
        console.error('Error creating permission in localStorage:', error);
        throw error;
      }
    },
    
    updatePermission: async (id, permissionData) => {
      try {
        const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        const index = permissions.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('Permission not found');
        
        permissions[index] = { ...permissions[index], ...permissionData };
        localStorage.setItem('permissions', JSON.stringify(permissions));
        return permissions[index];
      } catch (error) {
        console.error('Error updating permission in localStorage:', error);
        throw error;
      }
    },
    
    deletePermission: async (id) => {
      try {
        const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        const filteredPermissions = permissions.filter(p => p.id !== parseInt(id));
        
        localStorage.setItem('permissions', JSON.stringify(filteredPermissions));
        return { success: true };
      } catch (error) {
        console.error('Error deleting permission from localStorage:', error);
        throw error;
      }
    }
  }
};

// Post/announcement services
const postService = {
  // Get all posts
  getPosts: handleRequest(
    async () => {
      const response = await axios.get('/api/posts');
      return response;
    },
    mockApiService.getPosts
  ),
  
  // Get post by ID
  getPost: handleRequest(
    async (id) => {
      const response = await axios.get(`/api/posts/${id}`);
      return response;
    },
    mockApiService.getPost
  ),
  
  // Create new post
  createPost: handleRequest(
    async (postData) => {
      const response = await axios.post('/api/posts', postData);
      return response;
    },
    mockApiService.createPost
  ),
  
  // Update post
  updatePost: handleRequest(
    async (id, postData) => {
      const response = await axios.put(`/api/posts/${id}`, postData);
      return response;
    },
    mockApiService.updatePost
  ),
  
  // Delete post
  deletePost: handleRequest(
    async (id) => {
      const response = await axios.delete(`/api/posts/${id}`);
      return response;
    },
    mockApiService.deletePost
  ),

  // Mock implementations that use localStorage
  mock: {
    getPosts: async () => {
      try {
        const posts = localStorage.getItem('posts');
        return posts ? JSON.parse(posts) : [];
      } catch (error) {
        console.error('Error retrieving posts from localStorage:', error);
        return [];
      }
    },
    
    createPost: async (postData) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const newPost = {
          ...postData,
          id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
          createdAt: new Date().toISOString()
        };
        
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        return newPost;
      } catch (error) {
        console.error('Error creating post in localStorage:', error);
        throw error;
      }
    },
    
    updatePost: async (id, postData) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const index = posts.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('Post not found');
        
        posts[index] = { ...posts[index], ...postData };
        localStorage.setItem('posts', JSON.stringify(posts));
        return posts[index];
      } catch (error) {
        console.error('Error updating post in localStorage:', error);
        throw error;
      }
    },
    
    deletePost: async (id) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const filteredPosts = posts.filter(p => p.id !== parseInt(id));
        
        localStorage.setItem('posts', JSON.stringify(filteredPosts));
        return { success: true };
      } catch (error) {
        console.error('Error deleting post from localStorage:', error);
        throw error;
      }
    }
  }
};

// Function to detect demo mode
const detectDemoMode = () => {
  const hostname = window.location.hostname;
  const isDemoEnvironment = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.includes('demo') || 
    hostname.includes('staging') ||
    hostname.includes('netlify') ||
    hostname.includes('github.io');
  
  const demoMode = isDemoEnvironment || localStorage.getItem('apiMode') === 'demo';
  
  // Initialize demo data if needed
  if (demoMode) {
    localStorage.setItem('apiMode', 'demo');
    initializeDemoDataIfNeeded();
  }
  
  return demoMode;
};

// Initialize demo mode detection on module load
detectDemoMode();

// Export services with API first, fallback to mock/localStorage
export const RoleService = {
  getRoles: handleRequest(roleService.api?.getRoles, roleService.mock.getRoles),
  getRole: handleRequest(roleService.api?.getRole, roleService.mock.getRole),
  createRole: handleRequest(roleService.api?.createRole, roleService.mock.createRole),
  updateRole: handleRequest(roleService.api?.updateRole, roleService.mock.updateRole),
  deleteRole: handleRequest(roleService.api?.deleteRole, roleService.mock.deleteRole)
};

export const PermissionService = {
  getPermissions: handleRequest(permissionService.api?.getPermissions, permissionService.mock.getPermissions),
  getPermission: handleRequest(permissionService.api?.getPermission, permissionService.mock.getPermission),
  createPermission: handleRequest(permissionService.api?.createPermission, permissionService.mock.createPermission),
  updatePermission: handleRequest(permissionService.api?.updatePermission, permissionService.mock.updatePermission),
  deletePermission: handleRequest(permissionService.api?.deletePermission, permissionService.mock.deletePermission)
};

export const PostService = {
  getPosts: handleRequest(postService.api?.getPosts, postService.mock.getPosts),
  getPost: handleRequest(postService.api?.getPost, postService.mock.getPost),
  createPost: handleRequest(postService.api?.createPost, postService.mock.createPost),
  updatePost: handleRequest(postService.api?.updatePost, postService.mock.updatePost),
  deletePost: handleRequest(postService.api?.deletePost, postService.mock.deletePost)
}; 