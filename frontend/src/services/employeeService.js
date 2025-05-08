import axios from 'axios';
import apiConfig, { API_BASE_URL } from '../config/api';
import { getStoredEmployees, storeCompressedEmployees } from '../utils/storageUtils';

// Get all employees
export const getEmployees = async (params) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return getEmployeesFromLocalStorage(params);
    }
    
    // Otherwise use API
    const response = await axios.get(`${API_BASE_URL}/api/employees`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    
    // Fallback to localStorage if API fails
    try {
      return getEmployeesFromLocalStorage(params);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return getEmployeeByIdFromLocalStorage(id);
    }
    
    // Otherwise use API
    const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee with id ${id}:`, error);
    
    // Fallback to localStorage if API fails
    try {
      return getEmployeeByIdFromLocalStorage(id);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Create new employee
export const createEmployee = async (employeeData) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return createEmployeeInLocalStorage(employeeData);
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append profile picture if exists
    if (employeeData.profilePictureFile) {
      formData.append('profilePicture', employeeData.profilePictureFile);
    }
    
    // Append all other fields
    Object.keys(employeeData).forEach(key => {
      if (key !== 'profilePictureFile' && employeeData[key] !== undefined) {
        formData.append(key, typeof employeeData[key] === 'object' 
          ? JSON.stringify(employeeData[key])
          : employeeData[key]);
      }
    });
    
    const response = await axios.post(`${API_BASE_URL}/api/employees`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Fallback to localStorage if API fails
    if (apiConfig.isDemoMode()) {
      try {
        return createEmployeeInLocalStorage(employeeData);
      } catch (fallbackError) {
        throw error; // If fallback also fails, throw the original error
      }
    }
    
    throw error;
  }
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return updateEmployeeInLocalStorage(id, employeeData);
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append profile picture if exists
    if (employeeData.profilePictureFile) {
      formData.append('profilePicture', employeeData.profilePictureFile);
    }
    
    // Append all other fields
    Object.keys(employeeData).forEach(key => {
      if (key !== 'profilePictureFile' && employeeData[key] !== undefined) {
        formData.append(key, typeof employeeData[key] === 'object' 
          ? JSON.stringify(employeeData[key])
          : employeeData[key]);
      }
    });
    
    const response = await axios.put(`${API_BASE_URL}/api/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating employee with id ${id}:`, error);
    
    // Fallback to localStorage if API fails
    if (apiConfig.isDemoMode()) {
      try {
        return updateEmployeeInLocalStorage(id, employeeData);
      } catch (fallbackError) {
        throw error; // If fallback also fails, throw the original error
      }
    }
    
    throw error;
  }
};

// Delete employee
export const deleteEmployee = async (id) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return deleteEmployeeFromLocalStorage(id);
    }
    
    const response = await axios.delete(`${API_BASE_URL}/api/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting employee with id ${id}:`, error);
    
    // Fallback to localStorage if API fails
    if (apiConfig.isDemoMode()) {
      try {
        return deleteEmployeeFromLocalStorage(id);
      } catch (fallbackError) {
        throw error; // If fallback also fails, throw the original error
      }
    }
    
    throw error;
  }
};

// Get employee statistics (for dashboard)
export const getEmployeeStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/employees/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    throw error;
  }
};

// Helper functions for localStorage operations
const getEmployeesFromLocalStorage = (params = {}) => {
  const storedEmployees = getStoredEmployees();
  
  // Apply filters
  let filteredEmployees = [...storedEmployees];
  
  if (params.search) {
    const search = params.search.toLowerCase();
    filteredEmployees = filteredEmployees.filter(emp => 
      (emp.firstName && emp.firstName.toLowerCase().includes(search)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(search)) ||
      (emp.email && emp.email.toLowerCase().includes(search)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(search)) ||
      (emp.department && emp.department.toLowerCase().includes(search)) ||
      (emp.jobTitle && emp.jobTitle.toLowerCase().includes(search))
    );
  }
  
  if (params.department) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.department === params.department
    );
  }
  
  if (params.employmentStatus) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.employmentStatus === params.employmentStatus
    );
  }
  
  if (params.jobTitle) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.jobTitle === params.jobTitle
    );
  }
  
  // Apply sorting
  if (params.sortBy) {
    filteredEmployees.sort((a, b) => {
      if (!a[params.sortBy]) return params.sortOrder === 'asc' ? 1 : -1;
      if (!b[params.sortBy]) return params.sortOrder === 'asc' ? -1 : 1;
      
      if (a[params.sortBy] < b[params.sortBy]) {
        return params.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[params.sortBy] > b[params.sortBy]) {
        return params.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  
  return {
    data: {
      employees: paginatedEmployees,
      pagination: {
        total: filteredEmployees.length,
        page: page,
        limit: limit,
        pages: Math.ceil(filteredEmployees.length / limit)
      }
    }
  };
};

const getEmployeeByIdFromLocalStorage = (id) => {
  const storedEmployees = getStoredEmployees();
  const employee = storedEmployees.find(emp => emp.id.toString() === id.toString());
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return { data: employee };
};

const createEmployeeInLocalStorage = (employeeData) => {
  const storedEmployees = getStoredEmployees();
  
  // Create a new employee with ID
  const newEmployee = {
    ...employeeData,
    id: Date.now(), // Use timestamp as ID for demo
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Handle profile picture
  if (employeeData.profilePictureFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        newEmployee.profilePicture = reader.result;
        
        // Add to array and save
        storedEmployees.push(newEmployee);
        storeCompressedEmployees(storedEmployees);
        
        resolve({
          data: newEmployee,
          message: 'Employee created successfully'
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(employeeData.profilePictureFile);
    });
  } else {
    // Add to array and save
    storedEmployees.push(newEmployee);
    storeCompressedEmployees(storedEmployees);
    
    return {
      data: newEmployee,
      message: 'Employee created successfully'
    };
  }
};

const updateEmployeeInLocalStorage = (id, employeeData) => {
  const storedEmployees = getStoredEmployees();
  const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
  
  if (employeeIndex === -1) {
    throw new Error('Employee not found');
  }
  
  // Create updated employee
  const updatedEmployee = {
    ...storedEmployees[employeeIndex],
    ...employeeData,
    updatedAt: new Date().toISOString()
  };
  
  // Handle profile picture
  if (employeeData.profilePictureFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        updatedEmployee.profilePicture = reader.result;
        
        // Update array and save
        storedEmployees[employeeIndex] = updatedEmployee;
        storeCompressedEmployees(storedEmployees);
        
        resolve({
          data: updatedEmployee,
          message: 'Employee updated successfully'
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(employeeData.profilePictureFile);
    });
  } else {
    // Update array and save
    storedEmployees[employeeIndex] = updatedEmployee;
    storeCompressedEmployees(storedEmployees);
    
    return {
      data: updatedEmployee,
      message: 'Employee updated successfully'
    };
  }
};

const deleteEmployeeFromLocalStorage = (id) => {
  const storedEmployees = getStoredEmployees();
  const updatedEmployees = storedEmployees.filter(emp => emp.id.toString() !== id.toString());
  
  if (updatedEmployees.length === storedEmployees.length) {
    throw new Error('Employee not found');
  }
  
  storeCompressedEmployees(updatedEmployees);
  
  return {
    message: 'Employee deleted successfully'
  };
}; 