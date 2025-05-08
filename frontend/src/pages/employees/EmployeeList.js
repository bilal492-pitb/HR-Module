import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  VpnKey as VpnKeyIcon,
  FileUpload as FileUploadIcon,
  Storage as StorageIcon,
  CleaningServices as CleaningServicesIcon,
  PersonAdd as PersonAddIcon,
  ImportExport as ImportExportIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { AuthContext } from '../../context/AuthContext';
import { 
  getStoredEmployees as getAllStoredEmployees,
  checkStorageSpace
} from '../../utils/storageUtils';
import { fetchStoredEmployees, saveCompressedEmployees } from '../../utils/employeeStorageUtils';
import { getEmployees, deleteEmployee } from '../../services/employeeService';
import DataMigrationTool from '../../components/migration/DataMigrationTool';
import { checkForMigrationNeeded } from '../../utils/migrationUtils';

// Function to generate a username based on employee name
const generateUsername = (firstName, lastName, employeeId) => {
  const firstInitial = firstName ? firstName.charAt(0).toLowerCase() : '';
  const lastNamePart = lastName ? lastName.toLowerCase() : '';
  const idPart = employeeId ? employeeId.replace(/\D/g, '') : '';
  return `${firstInitial}${lastNamePart}${idPart}`.replace(/\s+/g, '');
};

// Function to generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const { hasRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    employmentStatus: '',
    jobTitle: '',
    appointmentGrade: ''
  });
  
  // Add missing state variables
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [grades, setGrades] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [passwordTooltip, setPasswordTooltip] = useState({ id: null, open: false });
  const [storageInfo, setStorageInfo] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [confirmCleanupOpen, setConfirmCleanupOpen] = useState(false);
  const [cleanupOptions, setCleanupOptions] = useState({
    removeImages: true,
    removeDocuments: true,
    optimizeStorage: true
  });
  const [showMigrationTool, setShowMigrationTool] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch employees on component mount and when search/filters change
  useEffect(() => {
    fetchEmployees();
  }, [paginationModel, searchQuery, filterOptions]);

  // Extract unique departments, job titles, and employment statuses for filters
  useEffect(() => {
    if (employees.length > 0) {
      // Set predefined departments
      setDepartments(['Food', 'Agriculture', 'Drug', 'Admin', 'HR', 'Legal', 'Finance']);

      // Extract unique employment statuses
      const uniqueStatuses = [...new Set(employees
        .filter(emp => emp.employmentStatus)
        .map(emp => emp.employmentStatus))];
      setEmploymentStatuses(uniqueStatuses);

      // Extract unique job titles
      const uniqueJobTitles = [...new Set(employees
        .filter(emp => emp.jobTitle)
        .map(emp => emp.jobTitle))];
      setJobTitles(uniqueJobTitles);

      // Extract unique appointment grades for grade filter
      const uniqueGrades = [...new Set(employees
        .filter(emp => emp.appointmentGrade)
        .map(emp => emp.appointmentGrade))];
      setGrades(uniqueGrades);
    }
  }, [employees]);

  // Add useEffect to check storage on component mount
  useEffect(() => {
    // Check storage space on component mount
    const spaceInfo = checkStorageSpace();
    setStorageInfo(spaceInfo);
    
    // Check if migration is needed
    const migrationCheck = checkForMigrationNeeded();
    if (migrationCheck.needed && spaceInfo.percentUsed > 80) {
      // If storage is nearly full and we have data to migrate, suggest migration
      setShowMigrationTool(true);
    }
  }, [employees]);

  // Fetch employees with pagination, search, and filters
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Try API first
      try {
        const params = {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          sortBy: sortField,
          sortOrder: sortDirection,
          search: searchQuery,
          department: filterOptions.department,
          employmentStatus: filterOptions.employmentStatus,
          jobTitle: filterOptions.jobTitle
        };
        
        const response = await getEmployees(params);
        
        setEmployees(response.data.employees);
        setTotalEmployees(response.data.pagination.total);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // If API fails, fall back to localStorage
      }
      
      // For demo: Get data from localStorage using compression
      try {
        const employeesFromStorage = fetchStoredEmployees();
        
        // Apply filters if any
        let filteredEmployees = [...employeesFromStorage];
        
        if (searchQuery) {
          const search = searchQuery.toLowerCase().trim();
          filteredEmployees = filteredEmployees.filter(emp => 
            (emp.firstName && emp.firstName.toLowerCase().includes(search)) ||
            (emp.lastName && emp.lastName.toLowerCase().includes(search)) ||
            (emp.email && emp.email.toLowerCase().includes(search)) ||
            (emp.employeeId && emp.employeeId.toLowerCase().includes(search)) ||
            (emp.department && emp.department.toLowerCase().includes(search)) ||
            (emp.jobTitle && emp.jobTitle.toLowerCase().includes(search))
          );
        }
        
        if (filterOptions.department) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.department === filterOptions.department
          );
        }
        
        if (filterOptions.employmentStatus) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.employmentStatus === filterOptions.employmentStatus
          );
        }
        
        if (filterOptions.jobTitle) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.jobTitle === filterOptions.jobTitle
          );
        }
        
        if (filterOptions.appointmentGrade) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.appointmentGrade === filterOptions.appointmentGrade
          );
        }
        
        // Apply sorting
        if (sortField) {
          filteredEmployees.sort((a, b) => {
            if (!a[sortField]) return sortDirection === 'asc' ? 1 : -1;
            if (!b[sortField]) return sortDirection === 'asc' ? -1 : 1;
            
            const valueA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
            const valueB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
            
            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
        }
        
        // Get paginated data
        const paginatedEmployees = filteredEmployees.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize
        );
        
        setEmployees(paginatedEmployees);
        setTotalEmployees(filteredEmployees.length);
        
        // Update storage info
        setStorageInfo(checkStorageSpace());
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError);
        throw new Error('Failed to fetch employee data');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      setDeleting(true);
      
      // Try API first
      try {
        await deleteEmployee(employeeToDelete.id);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully!',
          severity: 'success'
        });
        
        // Close the dialog and refetch
        setDeleteDialogOpen(false);
        fetchEmployees();
        return;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // If API fails, fall back to localStorage
      }
      
      // Fallback to localStorage
      try {
        const employeesFromStorage = fetchStoredEmployees();
        const updatedEmployees = employeesFromStorage.filter(emp => emp.id !== employeeToDelete.id);
        
        // Save using compression
        saveCompressedEmployees(updatedEmployees);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully!',
          severity: 'success'
        });
        
        // Close the dialog and refetch
        setDeleteDialogOpen(false);
        fetchEmployees();
        
        // Update storage info
        setStorageInfo(checkStorageSpace());
      } catch (localStorageError) {
        console.error('Error updating localStorage:', localStorageError);
        throw new Error('Failed to delete employee data');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete employee: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterOptions({
      department: '',
      employmentStatus: '',
      jobTitle: '',
      appointmentGrade: ''
    });
    setSearchQuery('');
  };

  // Toggle password tooltip
  const handleTogglePasswordTooltip = (id) => {
    setPasswordTooltip(prev => ({
      id: prev.id === id && prev.open ? null : id,
      open: !(prev.id === id && prev.open)
    }));
  };

  // Generate usernames and passwords for employees who don't have them
  const generateCredentialsForAll = () => {
    try {
      const currentEmployees = getAllStoredEmployees();
      
      // Map through employees and add credentials if missing
      const updatedEmployees = currentEmployees.map(emp => {
        // Check if employee already has credentials
        if (!emp.username || !emp.password) {
          return {
            ...emp,
            username: emp.username || generateUsername(emp.firstName, emp.lastName, emp.employeeId),
            password: emp.password || generatePassword(),
            updatedAt: new Date().toISOString()
          };
        }
        return emp;
      });
      
      // Save back to localStorage
      saveCompressedEmployees(updatedEmployees);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Credentials generated successfully for all employees',
        severity: 'success'
      });
      
      // Refresh employee list
      fetchEmployees();
    } catch (err) {
      console.error('Error generating credentials:', err);
      setSnackbar({
        open: true,
        message: 'Failed to generate credentials',
        severity: 'error'
      });
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event) => {
    setImportFile(event.target.files[0]);
    setImportError(null);
  };

  // Open the file input dialog programmatically
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle import employees from file
  const importEmployees = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const fileContent = e.target.result;
          const importedEmployees = JSON.parse(fileContent);
          
          if (!Array.isArray(importedEmployees)) {
            throw new Error('Invalid format: File must contain an array of employees');
          }
          
          // Validate each employee has required fields
          const validEmployees = importedEmployees.filter(emp => 
            emp && typeof emp === 'object' && 
            emp.firstName && emp.lastName && emp.employeeId
          );
          
          if (validEmployees.length === 0) {
            throw new Error('No valid employee records found in the import file');
          }
          
          // Get existing employees and merge, avoiding duplicates by employeeId
          const existingEmployeesData = getAllStoredEmployees();
          const existingIds = new Set(existingEmployeesData.map(emp => emp.employeeId));
          
          const newEmployees = [];
          const updatedEmployees = [];
          
          validEmployees.forEach(emp => {
            // Ensure each employee has an ID
            if (!emp.id) {
              emp.id = Date.now() + Math.floor(Math.random() * 1000);
            }
            
            // Check if employee already exists by employeeId
            if (existingIds.has(emp.employeeId)) {
              // Update existing employee
              const index = existingEmployeesData.findIndex(e => e.employeeId === emp.employeeId);
              if (index !== -1) {
                existingEmployeesData[index] = { ...existingEmployeesData[index], ...emp, updatedAt: new Date().toISOString() };
                updatedEmployees.push(emp);
              }
            } else {
              // Add new employee
              emp.createdAt = emp.createdAt || new Date().toISOString();
              emp.updatedAt = new Date().toISOString();
              existingEmployeesData.push(emp);
              newEmployees.push(emp);
              existingIds.add(emp.employeeId);
            }
          });
          
          // Save using compression
          saveCompressedEmployees(existingEmployeesData);
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Import successful: Added ${newEmployees.length} new employees, updated ${updatedEmployees.length} existing employees`,
            severity: 'success'
          });
          
          // Refresh the employee list
          fetchEmployees();
          
          // Close dialog
          setImportDialogOpen(false);
          setImportFile(null);
          
          // Update storage info
          setStorageInfo(checkStorageSpace());
          
        } catch (parseError) {
          console.error('Error parsing import file:', parseError);
          setImportError(`Error parsing file: ${parseError.message}`);
        }
      };
      
      reader.onerror = () => {
        setImportError('Error reading file');
      };
      
      reader.readAsText(importFile);
      
    } catch (err) {
      console.error('Error importing employees:', err);
      setImportError(`Import failed: ${err.message}`);
    }
  };

  // Handle storage cleanup
  const handleCleanupStorage = () => {
    try {
      const allEmployeesForCleanup = getAllStoredEmployees();
      let modifiedCount = 0;
      
      // Create a deep copy of the employees array
      const optimizedEmployees = allEmployeesForCleanup.map(emp => {
        const employee = { ...emp };
        let modified = false;
        
        // Remove profile images if option selected
        if (cleanupOptions.removeImages && employee.profilePicture) {
          delete employee.profilePicture;
          modified = true;
        }
        
        // Remove document URLs if option selected
        if (cleanupOptions.removeDocuments) {
          // Handle qualifications documents
          if (employee.qualifications) {
            employee.qualifications = employee.qualifications.map(qual => {
              const newQual = { ...qual };
              if (newQual.documentUrl) {
                delete newQual.documentUrl;
                modified = true;
              }
              return newQual;
            });
          }
          
          // Handle training documents
          if (employee.trainings) {
            employee.trainings = employee.trainings.map(training => {
              const newTraining = { ...training };
              if (newTraining.certificateUrl) {
                delete newTraining.certificateUrl;
                modified = true;
              }
              return newTraining;
            });
          }
          
          // Handle medical records documents
          if (employee.medicalRecords) {
            employee.medicalRecords = employee.medicalRecords.map(record => {
              const newRecord = { ...record };
              if (newRecord.documentUrl) {
                delete newRecord.documentUrl;
                modified = true;
              }
              return newRecord;
            });
          }
        }
        
        // Count if employee was modified
        if (modified) {
          modifiedCount++;
        }
        
        return employee;
      });
      
      // Save optimized data with compression
      if (cleanupOptions.optimizeStorage || modifiedCount > 0) {
        saveCompressedEmployees(optimizedEmployees);
        
        // Clear the uncompressed version if we're optimizing storage
        if (cleanupOptions.optimizeStorage) {
          localStorage.removeItem('employees');
        }
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Storage cleanup complete. ${modifiedCount} employees optimized.`,
        severity: 'success'
      });
      
      // Update storage info
      setStorageInfo(checkStorageSpace());
      
      // Close dialog
      setConfirmCleanupOpen(false);
      
      // Refresh the employee list
      fetchEmployees();
      
    } catch (err) {
      console.error('Error cleaning up storage:', err);
      setSnackbar({
        open: true,
        message: `Storage cleanup failed: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Add function to handle sorting
  const handleSortModelChange = (model) => {
    if (model.length > 0) {
      setSortField(model[0].field);
      setSortDirection(model[0].sort);
    } else {
      setSortField('id');
      setSortDirection('asc');
    }
  };

  const handleMigrationComplete = () => {
    setShowMigrationTool(false);
    setSnackbar({
      open: true,
      message: 'Data migration completed successfully!',
      severity: 'success'
    });
    
    // Refresh employee list
    fetchEmployees();
    
    // Update storage info
    const spaceInfo = checkStorageSpace();
    setStorageInfo(spaceInfo);
  };

  // DataGrid columns
  const columns = [
    { field: 'employeeId', headerName: 'Employee ID', width: 130 },
    { 
      field: 'fullName', 
      headerName: 'Name', 
      width: 200,
      valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`
    },
    { field: 'email', headerName: 'Email', width: 230 },
    { field: 'username', headerName: 'Username', width: 150 },
    { 
      field: 'password', 
      headerName: 'Password', 
      width: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {params.row.password ? (
            <>
              <span>{passwordTooltip.id === params.row.id && passwordTooltip.open ? params.row.password : '********'}</span>
              <Tooltip title={passwordTooltip.id === params.row.id && passwordTooltip.open ? "Hide Password" : "Show Password"}>
                <IconButton 
                  size="small" 
                  onClick={() => handleTogglePasswordTooltip(params.row.id)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : 'N/A'}
        </Box>
      )
    },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'jobTitle', headerName: 'Job Title', width: 200 },
    { field: 'appointmentGrade', headerName: 'Grade', width: 100 },
    { field: 'employmentStatus', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/employees/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {hasRole('hr') && (
            <>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/employees/${params.row.id}/edit`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  onClick={() => openDeleteDialog(params.row)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      {showMigrationTool ? (
        <DataMigrationTool onComplete={handleMigrationComplete} />
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Employees</Typography>
            <Box>
              {hasRole('hr') && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<VpnKeyIcon />}
                    onClick={generateCredentialsForAll}
                    sx={{ mr: 2 }}
                  >
                    Generate Missing Credentials
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/employees/create')}
                    sx={{ mr: 1 }}
                  >
                    Add Employee
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                startIcon={<ImportExportIcon />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Import/Export
              </Button>
              
              {/* Add migration tool button */}
              {storageInfo && storageInfo.percentUsed > 60 && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<StorageIcon />}
                  onClick={() => setShowMigrationTool(true)}
                  sx={{ mr: 1 }}
                >
                  Migrate to Database
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<CleaningServicesIcon />}
                onClick={() => setConfirmCleanupOpen(true)}
                color="error"
              >
                Cleanup Storage
              </Button>
            </Box>
          </Box>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  placeholder="Search name, email, ID..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={8}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ mr: 1 }}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
              
              {showFilters && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Department"
                      value={filterOptions.department}
                      onChange={(e) => setFilterOptions({...filterOptions, department: e.target.value})}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Employment Status"
                      value={filterOptions.employmentStatus}
                      onChange={(e) => setFilterOptions({...filterOptions, employmentStatus: e.target.value})}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {employmentStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Job Title"
                      value={filterOptions.jobTitle}
                      onChange={(e) => setFilterOptions({...filterOptions, jobTitle: e.target.value})}
                    >
                      <MenuItem value="">All Job Titles</MenuItem>
                      {jobTitles.map((title) => (
                        <MenuItem key={title} value={title}>
                          {title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Grade"
                      value={filterOptions.appointmentGrade}
                      onChange={(e) => setFilterOptions({...filterOptions, appointmentGrade: e.target.value})}
                    >
                      <MenuItem value="">All Grades</MenuItem>
                      {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={employees}
              columns={columns}
              pagination
              paginationMode="server"
              rowCount={totalEmployees}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              loading={loading}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              sortingMode="server"
              onSortModelChange={handleSortModelChange}
              initialState={{
                sorting: {
                  sortModel: [{ field: sortField, sort: sortDirection }],
                },
              }}
            />
          </Paper>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this employee? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
              <Button 
                onClick={handleDeleteEmployee} 
                color="error"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Snackbar for messages */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
          
          {/* Import Dialog */}
          <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Import Employees</DialogTitle>
            <DialogContent>
              <Box sx={{ my: 2 }}>
                {importError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {importError}
                  </Alert>
                )}
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  Select a JSON file containing employee data to import. The file should contain an array of employee objects.
                </Typography>
                
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={triggerFileInput}
                    startIcon={<FileUploadIcon />}
                  >
                    Choose File
                  </Button>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {importFile ? importFile.name : 'No file selected'}
                  </Typography>
                </Box>
                
                <Alert severity="info">
                  Importing will add new employees and update existing ones matching by Employee ID.
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={importEmployees} 
                variant="contained" 
                color="primary"
                disabled={!importFile}
              >
                Import
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Storage Cleanup Dialog */}
          <Dialog open={confirmCleanupOpen} onClose={() => setConfirmCleanupOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Storage Management</DialogTitle>
            <DialogContent>
              <Box sx={{ my: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Current storage usage: {storageInfo?.used}MB of {storageInfo?.total}MB ({storageInfo?.percentUsed}%)
                </Alert>
                
                <Typography variant="h6" gutterBottom>
                  Storage Cleanup Options
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cleanupOptions.removeImages}
                      onChange={(e) => setCleanupOptions({...cleanupOptions, removeImages: e.target.checked})}
                    />
                  }
                  label="Remove profile images"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cleanupOptions.removeDocuments}
                      onChange={(e) => setCleanupOptions({...cleanupOptions, removeDocuments: e.target.checked})}
                    />
                  }
                  label="Remove document attachments"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cleanupOptions.optimizeStorage}
                      onChange={(e) => setCleanupOptions({...cleanupOptions, optimizeStorage: e.target.checked})}
                    />
                  }
                  label="Optimize storage format (use compression only)"
                />
                
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Warning: This action cannot be undone. Images and documents will be permanently removed.
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmCleanupOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCleanupStorage} 
                variant="contained" 
                color="warning"
                startIcon={<CleaningServicesIcon />}
              >
                Clean Up
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default EmployeeList; 