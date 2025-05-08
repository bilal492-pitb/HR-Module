// Mock data for demo mode
// This file contains data that will be used when the app is running in demo mode
// It simulates API responses without requiring a backend

// Mock employees data
export const mockEmployees = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    position: 'Senior Developer',
    department: 'Engineering',
    phoneNumber: '(555) 123-4567',
    hireDate: '2020-01-15',
    salary: 85000,
    manager: 'Jane Smith',
    status: 'Active'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    position: 'Engineering Manager',
    department: 'Engineering',
    phoneNumber: '(555) 234-5678',
    hireDate: '2019-03-10',
    salary: 110000,
    manager: 'Michael Chen',
    status: 'Active'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    position: 'CTO',
    department: 'Executive',
    phoneNumber: '(555) 345-6789',
    hireDate: '2018-05-22',
    salary: 150000,
    manager: null,
    status: 'Active'
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    position: 'HR Specialist',
    department: 'Human Resources',
    phoneNumber: '(555) 456-7890',
    hireDate: '2021-02-18',
    salary: 72000,
    manager: 'Lisa Wong',
    status: 'Active'
  },
  {
    id: 5,
    firstName: 'Lisa',
    lastName: 'Wong',
    email: 'lisa.wong@example.com',
    position: 'HR Director',
    department: 'Human Resources',
    phoneNumber: '(555) 567-8901',
    hireDate: '2017-11-05',
    salary: 125000,
    manager: 'Michael Chen',
    status: 'Active'
  }
];

// Mock roles data
export const mockRoles = [
  {
    id: 1,
    name: 'admin',
    description: 'Full system access',
    permissionIds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: 'hr',
    description: 'HR department access',
    permissionIds: [1, 7, 8, 9]
  },
  {
    id: 3,
    name: 'manager',
    description: 'Department manager access',
    permissionIds: [6, 10, 11]
  },
  {
    id: 4,
    name: 'employee',
    description: 'Basic employee access',
    permissionIds: [12, 13, 14]
  }
];

// Mock permissions data
export const mockPermissions = [
  { id: 1, name: 'view_all', description: 'View all system data' },
  { id: 2, name: 'edit_all', description: 'Edit all system data' },
  { id: 3, name: 'delete_all', description: 'Delete any system data' },
  { id: 4, name: 'manage_users', description: 'Create and manage user accounts' },
  { id: 5, name: 'manage_roles', description: 'Create and assign roles' },
  { id: 6, name: 'view_department', description: 'View department data' },
  { id: 7, name: 'edit_employees', description: 'Edit employee profiles' },
  { id: 8, name: 'manage_leaves', description: 'Manage leave requests' },
  { id: 9, name: 'manage_departments', description: 'Create and manage departments' },
  { id: 10, name: 'approve_leaves', description: 'Approve team leave requests' },
  { id: 11, name: 'edit_team', description: 'Edit team members data' },
  { id: 12, name: 'view_profile', description: 'View own profile' },
  { id: 13, name: 'request_leave', description: 'Submit leave requests' },
  { id: 14, name: 'update_personal_info', description: 'Update personal information' }
];

// Mock posts/announcements data
export const mockPosts = [
  {
    id: 1,
    name: 'Senior Developer',
    numberOfPositions: 5,
    filled: 3,
    vacant: 2,
    grade: 4,
    department: 'IT',
    position: 'Headquarters'
  },
  {
    id: 2,
    name: 'HR Manager',
    numberOfPositions: 2,
    filled: 1,
    vacant: 1,
    grade: 5,
    department: 'HR',
    position: 'Main Office'
  },
  {
    id: 3,
    name: 'Finance Analyst',
    numberOfPositions: 3,
    filled: 2,
    vacant: 1,
    grade: 3,
    department: 'Finance',
    position: 'Regional Office'
  },
  {
    id: 4,
    name: 'Administrative Assistant',
    numberOfPositions: 4,
    filled: 2,
    vacant: 2,
    grade: 2,
    department: 'Admin',
    position: 'All Locations'
  }
];

// Helper functions for mock API operations

// Generate a new ID for a collection
export const getNewId = (collection) => {
  const maxId = Math.max(...collection.map(item => item.id), 0);
  return maxId + 1;
};

// Mock API response delay
export const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Health check endpoint for API connectivity testing
export const healthCheck = async () => {
  await mockDelay(200);
  return {
    data: {
      status: 'ok',
      message: 'API is healthy',
      mode: 'demo'
    }
  };
};

// Mock API response wrapper
export const mockResponse = async (data, error = null, delay = 500) => {
  await mockDelay(delay);
  if (error) {
    throw new Error(error);
  }
  return { data };
};

// Mock API service
export const mockApiService = {
  // Employees
  getEmployees: async () => mockResponse(mockEmployees),
  getEmployee: async (id) => {
    const employee = mockEmployees.find(emp => emp.id === parseInt(id));
    if (!employee) {
      return mockResponse(null, 'Employee not found', 500);
    }
    return mockResponse(employee);
  },
  createEmployee: async (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: getNewId(mockEmployees),
      status: 'Active'
    };
    mockEmployees.push(newEmployee);
    return mockResponse(newEmployee);
  },
  updateEmployee: async (id, employeeData) => {
    const index = mockEmployees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Employee not found', 500);
    }
    mockEmployees[index] = { ...mockEmployees[index], ...employeeData };
    return mockResponse(mockEmployees[index]);
  },
  deleteEmployee: async (id) => {
    const index = mockEmployees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Employee not found', 500);
    }
    const deletedEmployee = mockEmployees.splice(index, 1)[0];
    return mockResponse({ success: true, id: deletedEmployee.id });
  },
  
  // Roles
  getRoles: async () => mockResponse(mockRoles),
  getRole: async (id) => {
    const role = mockRoles.find(r => r.id === parseInt(id));
    if (!role) {
      return mockResponse(null, 'Role not found', 500);
    }
    return mockResponse(role);
  },
  createRole: async (roleData) => {
    const newRole = {
      ...roleData,
      id: getNewId(mockRoles)
    };
    mockRoles.push(newRole);
    return mockResponse(newRole);
  },
  updateRole: async (id, roleData) => {
    const index = mockRoles.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Role not found', 500);
    }
    mockRoles[index] = { ...mockRoles[index], ...roleData };
    return mockResponse(mockRoles[index]);
  },
  deleteRole: async (id) => {
    const index = mockRoles.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Role not found', 500);
    }
    const deletedRole = mockRoles.splice(index, 1)[0];
    return mockResponse({ success: true, id: deletedRole.id });
  },
  
  // Permissions
  getPermissions: async () => mockResponse(mockPermissions),
  
  // Posts
  getPosts: async () => mockResponse(mockPosts),
  getPost: async (id) => {
    const post = mockPosts.find(p => p.id === parseInt(id));
    if (!post) {
      return mockResponse(null, 'Post not found', 500);
    }
    return mockResponse(post);
  },
  createPost: async (postData) => {
    const newPost = {
      ...postData,
      id: getNewId(mockPosts),
      date: new Date().toISOString()
    };
    mockPosts.push(newPost);
    return mockResponse(newPost);
  },
  updatePost: async (id, postData) => {
    const index = mockPosts.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Post not found', 500);
    }
    mockPosts[index] = { ...mockPosts[index], ...postData };
    return mockResponse(mockPosts[index]);
  },
  deletePost: async (id) => {
    const index = mockPosts.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return mockResponse(null, 'Post not found', 500);
    }
    const deletedPost = mockPosts.splice(index, 1)[0];
    return mockResponse({ success: true, id: deletedPost.id });
  }
};

export default mockApiService; 