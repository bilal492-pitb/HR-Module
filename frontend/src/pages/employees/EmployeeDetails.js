import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Avatar,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Badge,
  Card,
  CardMedia,
  CardActions,
  TextField,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  School as SchoolIcon,
  FileOpen as FileOpenIcon,
  UploadFile as UploadFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FileDownload as FileDownloadIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Laptop as LaptopIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';
import { processFileForStorage, getStoredEmployees, storeCompressedEmployees, checkStorageSpace } from '../../utils/storageUtils';

// Import API services
import { getEmployeeById } from '../../services/employeeService'; // Remove deleteEmployee from import
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../../services/medicalRecordService';

// Tab Panel Component
import PropTypes from 'prop-types';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Refs for file inputs
  const profileImageInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  // New state for image upload dialogs
  const [openProfileImageDialog, setOpenProfileImageDialog] = useState(false);
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // New state for qualifications
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);
  const [qualificationForm, setQualificationForm] = useState({
    qualificationType: '',
    qualificationName: '',
    institution: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: ''
  });
  const [qualificationFormErrors, setQualificationFormErrors] = useState({});
  const [editingQualificationId, setEditingQualificationId] = useState(null);
  const [qualificationFilePreview, setQualificationFilePreview] = useState(null);

  // New state for dependents
  const [dependentDialogOpen, setDependentDialogOpen] = useState(false);
  const [dependentForm, setDependentForm] = useState({
    name: '',
    relation: '',
    contact: '',
    dateOfBirth: '',
    age: '',
    cnic: '',
    address: '',
    nationality: '',
    gender: '',
    disease: '',
    disability: '',
    nextOfKin: '',
    nextOfKinRelation: '',
    nextOfKinContact: ''
  });
  const [dependentFormErrors, setDependentFormErrors] = useState({});
  const [editingDependentId, setEditingDependentId] = useState(null);

  // Training state
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    trainingType: '',
    trainingName: '',
    institute: '',
    country: '',
    durationFrom: '',
    durationTo: '',
    file: null
  });
  const [trainingFormErrors, setTrainingFormErrors] = useState({});
  const [editingTrainingId, setEditingTrainingId] = useState(null);
  const [trainingFilePreview, setTrainingFilePreview] = useState(null);

  // Medical Records state
  const [medicalRecordDialogOpen, setMedicalRecordDialogOpen] = useState(false);
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    recordType: '',
    recordDate: '',
    expiryDate: '',
    description: '',
    provider: '',
    location: '',
    results: '',
    followUpRequired: false,
    followUpDate: '',
    notes: '',
    isConfidential: true
  });
  const [medicalRecordFormErrors, setMedicalRecordFormErrors] = useState({});
  const [editingMedicalRecordId, setEditingMedicalRecordId] = useState(null);
  const [medicalRecordFilePreview, setMedicalRecordFilePreview] = useState(null);

  // New state for credentials dialog
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({
    username: '',
    password: '',
    showPassword: false
  });

  // New state for salary
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    payAndAllowances: '',
    totalAmount: '',
    salarySlip: null
  });
  const [salaryFormErrors, setSalaryFormErrors] = useState({});
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [salaryFilePreview, setSalaryFilePreview] = useState(null);

  // New state for bank details
  const [bankDetailDialogOpen, setBankDetailDialogOpen] = useState(false);
  const [bankDetailForm, setBankDetailForm] = useState({
    bankName: '',
    accountNumber: ''
  });
  const [bankDetailFormErrors, setBankDetailFormErrors] = useState({});
  const [editingBankDetailId, setEditingBankDetailId] = useState(null);

  // New state for assets
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    assetType: '',
    assetName: '',
    declaredDate: '',
    details: ''
  });
  const [assetFormErrors, setAssetFormErrors] = useState({});
  const [editingAssetId, setEditingAssetId] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try using the API first
      try {
        const response = await getEmployeeById(id);
        setEmployee(response.data);
        
        // Fetch medical records separately
        const medicalRecordsResponse = await getMedicalRecords(id);
        setEmployee(prevEmployee => ({
          ...prevEmployee,
          medicalRecords: medicalRecordsResponse
        }));
        
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // If API fails, fall back to localStorage
      }
      
      // Fallback to localStorage
      const storedEmployees = getStoredEmployees();
      const foundEmployee = storedEmployees.find(emp => emp.id.toString() === id.toString());
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
      } else {
        setError('Employee not found');
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Error fetching employee details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      // For demo: Delete from localStorage
      try {
        const storedEmployees = getStoredEmployees();
        const updatedEmployees = storedEmployees.filter(emp => emp.id.toString() !== id.toString());
        
        storeCompressedEmployees(updatedEmployees);
        
        // Show success message and navigate back
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully',
          severity: 'success'
        });
        
        setTimeout(() => {
          navigate('/employees');
        }, 1500);
      } catch (localStorageError) {
        console.error('Error deleting from localStorage:', localStorageError);
        throw new Error('Failed to delete employee data');
      }
      
      // For production: This would be the actual API call
      // await axios.delete(`/api/employees/${id}`);
      // navigate('/employees');
    } catch (err) {
      console.error('Error deleting employee:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete employee',
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Full-Time':
        return 'success';
      case 'Part-Time':
        return 'info';
      case 'Contract':
        return 'warning';
      case 'Intern':
        return 'secondary';
      case 'Terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  // Initialize employee with empty arrays for qualifications, dependents, and trainings if they don't exist
  useEffect(() => {
    if (employee) {
      let needsUpdate = false;
      const updatedEmployee = { ...employee };
      
      if (!updatedEmployee.qualifications) {
        updatedEmployee.qualifications = [];
        needsUpdate = true;
      }
      
      if (!updatedEmployee.dependents) {
        updatedEmployee.dependents = [];
        needsUpdate = true;
      }
      
      if (!updatedEmployee.trainings) {
        updatedEmployee.trainings = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        setEmployee(updatedEmployee);
        
        // Also update in localStorage to ensure data persistence
        try {
          const storedEmployees = getStoredEmployees();
          const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
          
          if (employeeIndex !== -1) {
            storedEmployees[employeeIndex] = updatedEmployee;
            storeCompressedEmployees(storedEmployees);
          }
        } catch (err) {
          console.error('Error updating employee in localStorage:', err);
        }
      }
    }
  }, [employee, id]);

  // Update the file handler for qualification files
  const handleQualificationFileChange = async (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Check if we have enough space 
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `File too large (${Math.round(file.size/1024)}KB). Please upload a smaller file.`,
            severity: 'warning'
          });
        }
        
        setQualificationFilePreview(processedFile);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setSnackbar({
        open: true,
        message: 'Error processing file: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Fixed profile image handler
  const handleProfileImageChange = async (event) => {
    try {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        
        // Check if we have enough space 
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `Image too large (${Math.round(file.size/1024)}KB). Please upload a smaller image.`,
            severity: 'warning'
          });
          return;
        }
        
        setProfileImagePreview(processedFile);
        setOpenProfileImageDialog(true);
      }
    } catch (error) {
      console.error('Error processing profile image:', error);
      setSnackbar({
        open: true,
        message: 'Error processing image: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Fixed signature image handler
  const handleSignatureChange = async (event) => {
    try {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        
        // Check if we have enough space 
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 400, // Signature can be small
          maxHeight: 200,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `Image too large (${Math.round(file.size/1024)}KB). Please upload a smaller image.`,
            severity: 'warning'
          });
          return;
        }
        
        setSignaturePreview(processedFile);
        setOpenSignatureDialog(true);
      }
    } catch (error) {
      console.error('Error processing signature:', error);
      setSnackbar({
        open: true,
        message: 'Error processing signature: ' + error.message,
        severity: 'error'
      });
    }
  };

  // File input click handlers with safety checks
  const handleProfileImageClick = () => {
    if (profileImageInputRef.current) {
      profileImageInputRef.current.click();
    }
  };

  const handleSignatureClick = () => {
    if (signatureInputRef.current) {
      signatureInputRef.current.click();
    }
  };

  // Save profile image
  const handleSaveProfileImage = () => {
    if (profileImagePreview) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // In a real app, you would upload the file to a server and get a URL back
          // Here we're just storing the data URL in localStorage
          storedEmployees[employeeIndex] = {
            ...storedEmployees[employeeIndex],
            profilePicture: profileImagePreview,
            updatedAt: new Date().toISOString()
          };
          
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            profilePicture: profileImagePreview
          });
          
          setSnackbar({
            open: true,
            message: 'Profile image updated successfully!',
            severity: 'success'
          });
        }
      } catch (err) {
        console.error('Error updating profile image:', err);
        setSnackbar({
          open: true,
          message: 'Failed to update profile image',
          severity: 'error'
        });
      }
      
      // Close dialog and reset state
      setOpenProfileImageDialog(false);
      setProfileImagePreview(null);
    }
  };

  // Save signature
  const handleSaveSignature = () => {
    if (signaturePreview) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // In a real app, you would upload the file to a server and get a URL back
          // Here we're just storing the data URL in localStorage
          storedEmployees[employeeIndex] = {
            ...storedEmployees[employeeIndex],
            signature: signaturePreview,
            updatedAt: new Date().toISOString()
          };
          
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            signature: signaturePreview
          });
          
          setSnackbar({
            open: true,
            message: 'Signature updated successfully!',
            severity: 'success'
          });
        }
      } catch (err) {
        console.error('Error updating signature:', err);
        setSnackbar({
          open: true,
          message: 'Failed to update signature',
          severity: 'error'
        });
      }
      
      // Close dialog and reset state
      setOpenSignatureDialog(false);
      setSignaturePreview(null);
    }
  };

  // Handle qualification form input changes
  const handleQualificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQualificationForm({
      ...qualificationForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (qualificationFormErrors[name]) {
      setQualificationFormErrors({
        ...qualificationFormErrors,
        [name]: ''
      });
    }
  };

  // Open qualification dialog
  const handleOpenQualificationDialog = () => {
    setQualificationForm({
      qualificationType: '',
      qualificationName: '',
      institution: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: ''
    });
    setQualificationFormErrors({});
    setEditingQualificationId(null);
    setQualificationFilePreview(null);
    setQualificationDialogOpen(true);
  };

  // Validate qualification form
  const validateQualificationForm = () => {
    const errors = {};
    if (!qualificationForm.qualificationType) {
      errors.qualificationType = 'Qualification type is required';
    }
    if (!qualificationForm.qualificationName) {
      errors.qualificationName = 'Qualification name is required';
    }
    if (!qualificationForm.institution) {
      errors.institution = 'Institution is required';
    }
    if (!qualificationForm.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    setQualificationFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save qualification - improved with better error handling and null checks
  const handleSaveQualification = () => {
    if (validateQualificationForm()) {
      try {
        // For demo: Update in localStorage with compression
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a qualifications array
          if (!storedEmployees[employeeIndex].qualifications) {
            storedEmployees[employeeIndex].qualifications = [];
          }
          
          // Prepare qualification object
          const newQualification = {
            id: editingQualificationId || Date.now(),
            qualificationType: qualificationForm.qualificationType,
            qualificationName: qualificationForm.qualificationName,
            institution: qualificationForm.institution,
            startDate: qualificationForm.startDate,
            endDate: qualificationForm.endDate,
            grade: qualificationForm.grade,
            description: qualificationForm.description,
            documentUrl: qualificationFilePreview
          };
          
          let updatedQualifications;
          
          if (editingQualificationId) {
            // Update existing qualification
            updatedQualifications = storedEmployees[employeeIndex].qualifications.map(
              qual => qual.id.toString() === editingQualificationId.toString() ? newQualification : qual
            );
          } else {
            // Add new qualification
            updatedQualifications = [...storedEmployees[employeeIndex].qualifications, newQualification];
          }
          
          // Update employee in array
          storedEmployees[employeeIndex] = {
            ...storedEmployees[employeeIndex],
            qualifications: updatedQualifications,
            updatedAt: new Date().toISOString()
          };
          
          // Save back to localStorage with compression
          const compressionSuccessful = storeCompressedEmployees(storedEmployees);
          
          // If compression failed, also try the regular way
          if (!compressionSuccessful) {
            localStorage.setItem('employees', JSON.stringify(storedEmployees));
          }
          
          // Update local state
          setEmployee({
            ...employee,
            qualifications: updatedQualifications,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Qualification ${editingQualificationId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setQualificationDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving qualification:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save qualification: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete qualification - improved with better error handling
  const handleDeleteQualification = (qualificationId) => {
    try {
      // For demo: Update in localStorage with compression
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1 && storedEmployees[employeeIndex].qualifications) {
        // Filter out the qualification to delete
        const updatedQualifications = storedEmployees[employeeIndex].qualifications.filter(
          qual => qual.id.toString() !== qualificationId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex] = {
          ...storedEmployees[employeeIndex],
          qualifications: updatedQualifications,
          updatedAt: new Date().toISOString()
        };
        
        // Save back to localStorage with compression
        const compressionSuccessful = storeCompressedEmployees(storedEmployees);
        
        // If compression failed, also try the regular way
        if (!compressionSuccessful) {
          localStorage.setItem('employees', JSON.stringify(storedEmployees));
        }
        
        // Update local state
        setEmployee({
          ...employee,
          qualifications: updatedQualifications,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Qualification deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting qualification:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete qualification: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Handle dependent form input changes
  const handleDependentChange = (e) => {
    const { name, value } = e.target;
    setDependentForm({
      ...dependentForm,
      [name]: value
    });
    
    // Clear error when user types
    if (dependentFormErrors[name]) {
      setDependentFormErrors({
        ...dependentFormErrors,
        [name]: ''
      });
    }
  };

  // Open dependent dialog for new dependent
  const handleOpenDependentDialog = () => {
    setDependentForm({
      name: '',
      relation: '',
      contact: '',
      dateOfBirth: '',
      age: '',
      cnic: '',
      address: '',
      nationality: '',
      gender: '',
      disease: '',
      disability: '',
      nextOfKin: '',
      nextOfKinRelation: '',
      nextOfKinContact: ''
    });
    setDependentFormErrors({});
    setEditingDependentId(null);
    setDependentDialogOpen(true);
  };

  // Open dependent dialog for editing
  const handleEditDependent = (dependent) => {
    setDependentForm({
      name: dependent.name || '',
      relation: dependent.relation || '',
      contact: dependent.contact || '',
      dateOfBirth: dependent.dateOfBirth || '',
      age: dependent.age || '',
      cnic: dependent.cnic || '',
      address: dependent.address || '',
      nationality: dependent.nationality || '',
      gender: dependent.gender || '',
      disease: dependent.disease || '',
      disability: dependent.disability || '',
      nextOfKin: dependent.nextOfKin || '',
      nextOfKinRelation: dependent.nextOfKinRelation || '',
      nextOfKinContact: dependent.nextOfKinContact || ''
    });
    setDependentFormErrors({});
    setEditingDependentId(dependent.id);
    setDependentDialogOpen(true);
  };

  // Validate dependent form
  const validateDependentForm = () => {
    const errors = {};
    if (!dependentForm.name) {
      errors.name = 'Name is required';
    }
    if (!dependentForm.relation) {
      errors.relation = 'Relation is required';
    }
    
    setDependentFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save dependent
  const handleSaveDependent = () => {
    if (validateDependentForm()) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a dependents array
          if (!storedEmployees[employeeIndex].dependents) {
            storedEmployees[employeeIndex].dependents = [];
          }
          
          // Prepare dependent object
          const newDependent = {
            id: editingDependentId || Date.now(), // Use existing ID or create new one
            name: dependentForm.name,
            relation: dependentForm.relation,
            contact: dependentForm.contact,
            dateOfBirth: dependentForm.dateOfBirth,
            age: dependentForm.age,
            cnic: dependentForm.cnic,
            address: dependentForm.address,
            nationality: dependentForm.nationality,
            gender: dependentForm.gender,
            disease: dependentForm.disease,
            disability: dependentForm.disability,
            nextOfKin: dependentForm.nextOfKin,
            nextOfKinRelation: dependentForm.nextOfKinRelation,
            nextOfKinContact: dependentForm.nextOfKinContact,
            createdAt: new Date().toISOString()
          };
          
          let updatedDependents;
          
          if (editingDependentId) {
            // Update existing dependent
            updatedDependents = storedEmployees[employeeIndex].dependents.map(
              dep => dep.id.toString() === editingDependentId.toString() ? newDependent : dep
            );
          } else {
            // Add new dependent
            updatedDependents = [...storedEmployees[employeeIndex].dependents, newDependent];
          }
          
          // Update employee
          storedEmployees[employeeIndex].dependents = updatedDependents;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            dependents: updatedDependents,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Dependent ${editingDependentId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setDependentDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving dependent:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save dependent: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete dependent
  const handleDeleteDependent = (dependentId) => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1) {
        // Ensure the employee has a dependents array
        if (!storedEmployees[employeeIndex].dependents) {
          storedEmployees[employeeIndex].dependents = [];
          setSnackbar({
            open: true,
            message: 'No dependents to delete',
            severity: 'info'
          });
          return;
        }
        
        // Filter out the dependent to delete
        const updatedDependents = storedEmployees[employeeIndex].dependents.filter(
          dep => dep.id.toString() !== dependentId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].dependents = updatedDependents;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          dependents: updatedDependents,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Dependent deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting dependent:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete dependent: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Handle training form input changes
  const handleTrainingChange = (e) => {
    const { name, value } = e.target;
    setTrainingForm({
      ...trainingForm,
      [name]: value
    });
    
    // Clear error when user types
    if (trainingFormErrors[name]) {
      setTrainingFormErrors({
        ...trainingFormErrors,
        [name]: ''
      });
    }
  };

  // Update the training file handler
  const handleTrainingFileChange = async (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Check if we have enough space 
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `File too large (${Math.round(file.size/1024)}KB). Please upload a smaller file.`,
            severity: 'warning'
          });
        }
        
        setTrainingFilePreview(processedFile);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setSnackbar({
        open: true,
        message: 'Error processing file: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Open training dialog for new training
  const handleOpenTrainingDialog = () => {
    setTrainingForm({
      trainingType: '',
      trainingName: '',
      institute: '',
      country: '',
      durationFrom: '',
      durationTo: '',
      file: null
    });
    setTrainingFormErrors({});
    setEditingTrainingId(null);
    setTrainingFilePreview(null);
    setTrainingDialogOpen(true);
  };

  // Open training dialog for editing
  const handleEditTraining = (training) => {
    setTrainingForm({
      trainingType: training.trainingType || '',
      trainingName: training.trainingName || '',
      institute: training.institute || '',
      country: training.country || '',
      durationFrom: training.durationFrom || '',
      durationTo: training.durationTo || '',
      file: null
    });
    setTrainingFormErrors({});
    setEditingTrainingId(training.id);
    setTrainingFilePreview(training.fileUrl || null);
    setTrainingDialogOpen(true);
  };

  // Validate training form
  const validateTrainingForm = () => {
    const errors = {};
    if (!trainingForm.trainingType) {
      errors.trainingType = 'Training type is required';
    }
    if (!trainingForm.trainingName) {
      errors.trainingName = 'Training name is required';
    }
    
    setTrainingFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save training
  const handleSaveTraining = () => {
    if (validateTrainingForm()) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a trainings array
          if (!storedEmployees[employeeIndex].trainings) {
            storedEmployees[employeeIndex].trainings = [];
          }
          
          // Prepare training object
          const newTraining = {
            id: editingTrainingId || Date.now(), // Use existing ID or create new one
            trainingType: trainingForm.trainingType,
            trainingName: trainingForm.trainingName,
            institute: trainingForm.institute,
            country: trainingForm.country,
            durationFrom: trainingForm.durationFrom,
            durationTo: trainingForm.durationTo,
            fileUrl: trainingFilePreview, // Store the preview URL
            createdAt: new Date().toISOString()
          };
          
          let updatedTrainings;
          
          if (editingTrainingId) {
            // Update existing training
            updatedTrainings = storedEmployees[employeeIndex].trainings.map(
              training => training.id.toString() === editingTrainingId.toString() ? newTraining : training
            );
          } else {
            // Add new training
            updatedTrainings = [...storedEmployees[employeeIndex].trainings, newTraining];
          }
          
          // Update employee
          storedEmployees[employeeIndex].trainings = updatedTrainings;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            trainings: updatedTrainings,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Training ${editingTrainingId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setTrainingDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving training:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save training: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete training
  const handleDeleteTraining = (trainingId) => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1) {
        // Ensure the employee has a trainings array
        if (!storedEmployees[employeeIndex].trainings) {
          storedEmployees[employeeIndex].trainings = [];
          setSnackbar({
            open: true,
            message: 'No trainings to delete',
            severity: 'info'
          });
          return;
        }
        
        // Filter out the training to delete
        const updatedTrainings = storedEmployees[employeeIndex].trainings.filter(
          training => training.id.toString() !== trainingId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].trainings = updatedTrainings;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          trainings: updatedTrainings,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Training deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting training:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete training: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // New function to handle credentials changes
  const handleCredentialsChange = (e) => {
    const { name, value } = e.target;
    setCredentialsForm({
      ...credentialsForm,
      [name]: value
    });
  };

  // Toggle password visibility in credentials form
  const handleTogglePasswordVisibility = () => {
    setCredentialsForm({
      ...credentialsForm,
      showPassword: !credentialsForm.showPassword
    });
  };

  // Open credentials dialog
  const handleOpenCredentialsDialog = () => {
    setCredentialsForm({
      username: employee?.username || '',
      password: employee?.password || '',
      showPassword: false
    });
    setCredentialsDialogOpen(true);
  };

  // Save credentials
  const handleSaveCredentials = () => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1) {
        // Update employee credentials
        storedEmployees[employeeIndex] = {
          ...storedEmployees[employeeIndex],
          username: credentialsForm.username,
          password: credentialsForm.password,
          updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          username: credentialsForm.username,
          password: credentialsForm.password,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Credentials updated successfully!',
          severity: 'success'
        });
        
        // Close dialog
        setCredentialsDialogOpen(false);
      }
    } catch (err) {
      console.error('Error updating credentials:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update credentials: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Medical record file handler
  const handleMedicalRecordFileChange = async (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Check if we have enough space 
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `File too large (${Math.round(file.size/1024)}KB). Please upload a smaller file.`,
            severity: 'warning'
          });
        }
        
        setMedicalRecordFilePreview(processedFile);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setSnackbar({
        open: true,
        message: 'Error processing file: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Handle medical record form input changes
  const handleMedicalRecordChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMedicalRecordForm({
      ...medicalRecordForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (medicalRecordFormErrors[name]) {
      setMedicalRecordFormErrors({
        ...medicalRecordFormErrors,
        [name]: ''
      });
    }
  };

  // Open medical record dialog for new record
  const handleOpenMedicalRecordDialog = () => {
    setMedicalRecordForm({
      recordType: '',
      recordDate: '',
      expiryDate: '',
      description: '',
      provider: '',
      location: '',
      results: '',
      followUpRequired: false,
      followUpDate: '',
      notes: '',
      isConfidential: true
    });
    setMedicalRecordFormErrors({});
    setEditingMedicalRecordId(null);
    setMedicalRecordFilePreview(null);
    setMedicalRecordDialogOpen(true);
  };

  // Open medical record dialog for editing
  const handleEditMedicalRecord = (record) => {
    setMedicalRecordForm({
      recordType: record.recordType || '',
      recordDate: record.recordDate || '',
      expiryDate: record.expiryDate || '',
      description: record.description || '',
      provider: record.provider || '',
      location: record.location || '',
      results: record.results || '',
      followUpRequired: record.followUpRequired || false,
      followUpDate: record.followUpDate || '',
      notes: record.notes || '',
      isConfidential: record.isConfidential !== undefined ? record.isConfidential : true
    });
    setMedicalRecordFormErrors({});
    setEditingMedicalRecordId(record.id);
    setMedicalRecordFilePreview(record.documentUrl || null);
    setMedicalRecordDialogOpen(true);
  };

  // Validate medical record form
  const validateMedicalRecordForm = () => {
    const errors = {};
    if (!medicalRecordForm.recordType) {
      errors.recordType = 'Record type is required';
    }
    if (!medicalRecordForm.recordDate) {
      errors.recordDate = 'Record date is required';
    }
    if (medicalRecordForm.followUpRequired && !medicalRecordForm.followUpDate) {
      errors.followUpDate = 'Follow-up date is required when follow-up is needed';
    }
    
    setMedicalRecordFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save medical record
  const handleSaveMedicalRecord = async () => {
    if (validateMedicalRecordForm()) {
      try {
        // Prepare medical record data
        const medicalRecordData = {
          recordType: medicalRecordForm.recordType,
          recordDate: medicalRecordForm.recordDate,
          expiryDate: medicalRecordForm.expiryDate,
          description: medicalRecordForm.description,
          provider: medicalRecordForm.provider,
          location: medicalRecordForm.location,
          results: medicalRecordForm.results,
          followUpRequired: medicalRecordForm.followUpRequired,
          followUpDate: medicalRecordForm.followUpDate,
          notes: medicalRecordForm.notes,
          confidential: medicalRecordForm.isConfidential,
          documentFile: medicalRecordFilePreview instanceof File ? medicalRecordFilePreview : null
        };
        
        // Remove unused response variable
        // Try using the API first
        try {
          if (editingMedicalRecordId) {
            // Update existing medical record
            await updateMedicalRecord(id, editingMedicalRecordId, medicalRecordData);
          } else {
            // Create new medical record
            await createMedicalRecord(id, medicalRecordData);
          }
          
          // Refresh employee data to get updated medical records
          fetchEmployeeDetails();
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Medical record ${editingMedicalRecordId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setMedicalRecordDialogOpen(false);
          return;
        } catch (apiError) {
          console.warn('API call failed, falling back to localStorage:', apiError);
          // If API fails, fall back to localStorage
        }
        
        // Fallback to localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a medicalRecords array
          if (!storedEmployees[employeeIndex].medicalRecords) {
            storedEmployees[employeeIndex].medicalRecords = [];
          }
          
          // Prepare medical record object
          const newMedicalRecord = {
            id: editingMedicalRecordId || Date.now(), // Use existing ID or create new one
            recordType: medicalRecordForm.recordType,
            recordDate: medicalRecordForm.recordDate,
            expiryDate: medicalRecordForm.expiryDate,
            description: medicalRecordForm.description,
            provider: medicalRecordForm.provider,
            location: medicalRecordForm.location,
            results: medicalRecordForm.results,
            followUpRequired: medicalRecordForm.followUpRequired,
            followUpDate: medicalRecordForm.followUpDate,
            notes: medicalRecordForm.notes,
            isConfidential: medicalRecordForm.isConfidential,
            documentUrl: medicalRecordFilePreview, // Store the preview URL
            createdAt: new Date().toISOString()
          };
          
          let updatedMedicalRecords;
          
          if (editingMedicalRecordId) {
            // Update existing medical record
            updatedMedicalRecords = storedEmployees[employeeIndex].medicalRecords.map(
              record => record.id.toString() === editingMedicalRecordId.toString() ? newMedicalRecord : record
            );
          } else {
            // Add new medical record
            updatedMedicalRecords = [...storedEmployees[employeeIndex].medicalRecords, newMedicalRecord];
          }
          
          // Update employee
          storedEmployees[employeeIndex].medicalRecords = updatedMedicalRecords;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            medicalRecords: updatedMedicalRecords,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Medical record ${editingMedicalRecordId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setMedicalRecordDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving medical record:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save medical record: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete medical record
  const handleDeleteMedicalRecord = async (recordId) => {
    try {
      // Try using the API first
      try {
        await deleteMedicalRecord(id, recordId);
        
        // Refresh employee data to get updated medical records
        fetchEmployeeDetails();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Medical record deleted successfully!',
          severity: 'success'
        });
        return;
      } catch (apiError) {
        console.warn('API call failed, falling back to localStorage:', apiError);
        // If API fails, fall back to localStorage
      }
      
      // Fallback to localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1 && storedEmployees[employeeIndex].medicalRecords) {
        // Filter out the record to delete
        const updatedMedicalRecords = storedEmployees[employeeIndex].medicalRecords.filter(
          record => record.id.toString() !== recordId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].medicalRecords = updatedMedicalRecords;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          medicalRecords: updatedMedicalRecords,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Medical record deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting medical record:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete medical record: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Add exportEmployeeData function to allow exporting employee data
  const exportEmployeeData = () => {
    try {
      if (!employee) return;
      
      // Create a download link for the employee data
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employee, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `employee_${employee.id}_${employee.lastName}.json`);
      document.body.appendChild(downloadAnchorNode); // Required for Firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setSnackbar({
        open: true,
        message: 'Employee data exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting employee data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export employee data',
        severity: 'error'
      });
    }
  };

  // Add a handleEditQualification function if not exists
  const handleEditQualification = (qualification) => {
    setQualificationForm({
      qualificationType: qualification.qualificationType || '',
      qualificationName: qualification.qualificationName || '',
      institution: qualification.institution || '',
      startDate: qualification.startDate || '',
      endDate: qualification.endDate || '',
      grade: qualification.grade || '',
      description: qualification.description || ''
    });
    setQualificationFormErrors({});
    setEditingQualificationId(qualification.id);
    setQualificationFilePreview(qualification.documentUrl || null);
    setQualificationDialogOpen(true);
  };

  // Handle salary form input changes
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm({
      ...salaryForm,
      [name]: value
    });
    
    // Clear error when user types
    if (salaryFormErrors[name]) {
      setSalaryFormErrors({
        ...salaryFormErrors,
        [name]: ''
      });
    }
  };

  // Handle salary file change
  const handleSalaryFileChange = async (e) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Check if we have enough space
        const spaceInfo = checkStorageSpace();
        if (parseFloat(spaceInfo.available) < 0.5) { // Less than 0.5MB available
          setSnackbar({
            open: true,
            message: 'Not enough storage space. Please remove some files first.',
            severity: 'error'
          });
          return;
        }
        
        // Process file for storage (resizes/compresses if needed)
        const processedFile = await processFileForStorage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        });
        
        // Check if we got a file reference object instead of actual data
        if (processedFile && processedFile.type === 'fileReference' && processedFile.tooLarge) {
          setSnackbar({
            open: true,
            message: `File too large (${Math.round(file.size/1024)}KB). Please upload a smaller file.`,
            severity: 'warning'
          });
        }
        
        setSalaryFilePreview(processedFile);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setSnackbar({
        open: true,
        message: 'Error processing file: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Open salary dialog
  const handleOpenSalaryDialog = () => {
    setSalaryForm({
      payAndAllowances: '',
      totalAmount: '',
      salarySlip: null
    });
    setSalaryFormErrors({});
    setEditingSalaryId(null);
    setSalaryFilePreview(null);
    setSalaryDialogOpen(true);
  };

  // Validate salary form
  const validateSalaryForm = () => {
    const errors = {};
    if (!salaryForm.payAndAllowances) {
      errors.payAndAllowances = 'Pay and allowances are required';
    }
    if (!salaryForm.totalAmount) {
      errors.totalAmount = 'Total amount is required';
    }
    
    setSalaryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save salary
  const handleSaveSalary = () => {
    if (validateSalaryForm()) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a salaryHistory array
          if (!storedEmployees[employeeIndex].salaryHistory) {
            storedEmployees[employeeIndex].salaryHistory = [];
          }
          
          // Prepare salary object
          const newSalary = {
            id: editingSalaryId || Date.now(),
            payAndAllowances: salaryForm.payAndAllowances,
            totalAmount: salaryForm.totalAmount,
            documentUrl: salaryFilePreview,
            createdAt: new Date().toISOString()
          };
          
          let updatedSalaryHistory;
          
          if (editingSalaryId) {
            // Update existing salary record
            updatedSalaryHistory = storedEmployees[employeeIndex].salaryHistory.map(
              salary => salary.id.toString() === editingSalaryId.toString() ? newSalary : salary
            );
          } else {
            // Add new salary record
            updatedSalaryHistory = [...storedEmployees[employeeIndex].salaryHistory, newSalary];
          }
          
          // Update employee
          storedEmployees[employeeIndex].salaryHistory = updatedSalaryHistory;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            salaryHistory: updatedSalaryHistory,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Salary record ${editingSalaryId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setSalaryDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving salary record:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save salary record: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete salary record
  const handleDeleteSalary = (salaryId) => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1 && storedEmployees[employeeIndex].salaryHistory) {
        // Filter out the salary record to delete
        const updatedSalaryHistory = storedEmployees[employeeIndex].salaryHistory.filter(
          salary => salary.id.toString() !== salaryId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].salaryHistory = updatedSalaryHistory;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          salaryHistory: updatedSalaryHistory,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Salary record deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting salary record:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete salary record: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Handle bank detail form input changes
  const handleBankDetailChange = (e) => {
    const { name, value } = e.target;
    setBankDetailForm({
      ...bankDetailForm,
      [name]: value
    });
    
    // Clear error when user types
    if (bankDetailFormErrors[name]) {
      setBankDetailFormErrors({
        ...bankDetailFormErrors,
        [name]: ''
      });
    }
  };

  // Open bank detail dialog
  const handleOpenBankDetailDialog = () => {
    setBankDetailForm({
      bankName: '',
      accountNumber: ''
    });
    setBankDetailFormErrors({});
    setEditingBankDetailId(null);
    setBankDetailDialogOpen(true);
  };

  // Validate bank detail form
  const validateBankDetailForm = () => {
    const errors = {};
    if (!bankDetailForm.bankName) {
      errors.bankName = 'Bank name is required';
    }
    if (!bankDetailForm.accountNumber) {
      errors.accountNumber = 'Account number is required';
    }
    
    setBankDetailFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save bank detail
  const handleSaveBankDetail = () => {
    if (validateBankDetailForm()) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has a bankDetails array
          if (!storedEmployees[employeeIndex].bankDetails) {
            storedEmployees[employeeIndex].bankDetails = [];
          }
          
          // Prepare bank detail object
          const newBankDetail = {
            id: editingBankDetailId || Date.now(),
            bankName: bankDetailForm.bankName,
            accountNumber: bankDetailForm.accountNumber,
            createdAt: new Date().toISOString()
          };
          
          let updatedBankDetails;
          
          if (editingBankDetailId) {
            // Update existing bank detail
            updatedBankDetails = storedEmployees[employeeIndex].bankDetails.map(
              bankDetail => bankDetail.id.toString() === editingBankDetailId.toString() ? newBankDetail : bankDetail
            );
          } else {
            // Add new bank detail
            updatedBankDetails = [...storedEmployees[employeeIndex].bankDetails, newBankDetail];
          }
          
          // Update employee
          storedEmployees[employeeIndex].bankDetails = updatedBankDetails;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            bankDetails: updatedBankDetails,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Bank detail ${editingBankDetailId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setBankDetailDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving bank detail:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save bank detail: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete bank detail
  const handleDeleteBankDetail = (bankDetailId) => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1 && storedEmployees[employeeIndex].bankDetails) {
        // Filter out the bank detail to delete
        const updatedBankDetails = storedEmployees[employeeIndex].bankDetails.filter(
          bankDetail => bankDetail.id.toString() !== bankDetailId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].bankDetails = updatedBankDetails;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          bankDetails: updatedBankDetails,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Bank detail deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting bank detail:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete bank detail: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Handle asset form input changes
  const handleAssetChange = (e) => {
    const { name, value } = e.target;
    setAssetForm({
      ...assetForm,
      [name]: value
    });
    
    // Clear error when user types
    if (assetFormErrors[name]) {
      setAssetFormErrors({
        ...assetFormErrors,
        [name]: ''
      });
    }
  };

  // Open asset dialog
  const handleOpenAssetDialog = () => {
    setAssetForm({
      assetType: 'movable',
      assetName: '',
      declaredDate: new Date().toISOString().split('T')[0],
      details: ''
    });
    setAssetFormErrors({});
    setEditingAssetId(null);
    setAssetDialogOpen(true);
  };

  // Validate asset form
  const validateAssetForm = () => {
    const errors = {};
    if (!assetForm.assetType) {
      errors.assetType = 'Asset type is required';
    }
    if (!assetForm.assetName) {
      errors.assetName = 'Asset name is required';
    }
    if (!assetForm.declaredDate) {
      errors.declaredDate = 'Declared date is required';
    }
    
    setAssetFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save asset
  const handleSaveAsset = () => {
    if (validateAssetForm()) {
      try {
        // For demo: Update in localStorage
        const storedEmployees = getStoredEmployees();
        const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
        
        if (employeeIndex !== -1) {
          // Ensure the employee has an assets array
          if (!storedEmployees[employeeIndex].assets) {
            storedEmployees[employeeIndex].assets = [];
          }
          
          // Prepare asset object
          const newAsset = {
            id: editingAssetId || Date.now(),
            assetType: assetForm.assetType,
            assetName: assetForm.assetName,
            declaredDate: assetForm.declaredDate,
            details: assetForm.details,
            createdAt: new Date().toISOString()
          };
          
          let updatedAssets;
          
          if (editingAssetId) {
            // Update existing asset
            updatedAssets = storedEmployees[employeeIndex].assets.map(
              asset => asset.id.toString() === editingAssetId.toString() ? newAsset : asset
            );
          } else {
            // Add new asset
            updatedAssets = [...storedEmployees[employeeIndex].assets, newAsset];
          }
          
          // Update employee
          storedEmployees[employeeIndex].assets = updatedAssets;
          storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
          
          // Save to localStorage
          storeCompressedEmployees(storedEmployees);
          
          // Update local state
          setEmployee({
            ...employee,
            assets: updatedAssets,
            updatedAt: new Date().toISOString()
          });
          
          // Show success message
          setSnackbar({
            open: true,
            message: `Asset ${editingAssetId ? 'updated' : 'added'} successfully!`,
            severity: 'success'
          });
          
          // Close dialog
          setAssetDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving asset:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save asset: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    }
  };

  // Delete asset
  const handleDeleteAsset = (assetId) => {
    try {
      // For demo: Update in localStorage
      const storedEmployees = getStoredEmployees();
      const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === id.toString());
      
      if (employeeIndex !== -1 && storedEmployees[employeeIndex].assets) {
        // Filter out the asset to delete
        const updatedAssets = storedEmployees[employeeIndex].assets.filter(
          asset => asset.id.toString() !== assetId.toString()
        );
        
        // Update employee
        storedEmployees[employeeIndex].assets = updatedAssets;
        storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        storeCompressedEmployees(storedEmployees);
        
        // Update local state
        setEmployee({
          ...employee,
          assets: updatedAssets,
          updatedAt: new Date().toISOString()
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Asset deleted successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete asset: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!employee) {
    return (
      <Alert severity="error">Employee not found</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Employee Details
        </Typography>
        <Box>
          {hasRole('hr') && (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCredentialsDialog}
                sx={{ mr: 2 }}
              >
                Update Credentials
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/employees/${id}/edit`)}
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Box p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3} md={2} display="flex" flexDirection="column" alignItems="center">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Upload Profile Image">
                    <IconButton 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' } 
                      }}
                      onClick={handleProfileImageClick}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar 
                  src={employee.profilePicture || '/avatar-placeholder.png'} 
                  sx={{ width: 150, height: 150 }}
                >
                  {`${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`}
                </Avatar>
              </Badge>
              <input
                type="file"
                accept="image/*"
                ref={profileImageInputRef}
                style={{ display: 'none' }}
                onChange={handleProfileImageChange}
              />
              
              <Box mt={3} width="100%" display="flex" flexDirection="column" alignItems="center">
                <Typography variant="subtitle2" gutterBottom>
                  Signature
                </Typography>
                <Card 
                  sx={{ 
                    width: '100%', 
                    minHeight: 100, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {employee.signature ? (
                    <CardMedia
                      component="img"
                      sx={{ height: 100, objectFit: 'contain', width: '100%' }}
                      image={employee.signature}
                      alt="Employee signature"
                    />
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                      <Typography variant="body2" color="textSecondary">No signature</Typography>
                    </Box>
                  )}
                  <CardActions sx={{ width: '100%', justifyContent: 'center' }}>
                    <Button 
                      size="small" 
                      startIcon={<FileIcon />}
                      onClick={handleSignatureClick}
                    >
                      Upload
                    </Button>
                  </CardActions>
                </Card>
                <input
                  type="file"
                  accept="image/*"
                  ref={signatureInputRef}
                  style={{ display: 'none' }}
                  onChange={handleSignatureChange}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={9} md={10}>
              <Box mb={2}>
                <Typography variant="h4" gutterBottom>
                  {`${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`}
                </Typography>
                
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {employee.jobTitle || 'No Job Title'}
                </Typography>
                
                <Chip 
                  label={employee.employmentStatus || 'Not Specified'} 
                  color={getStatusColor(employee.employmentStatus)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={employee.department || 'No Department'} 
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {employee.email || 'No email'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {employee.phoneNumber || 'No phone number'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <CakeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {formatDate(employee.dateOfBirth)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <WorkIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Employee ID: {employee.employeeId}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <EventIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Joined: {formatDate(employee.joinDate)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Reports to: {employee.supervisor || 'Not Assigned'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#BFEA7C',
              },
              '& .MuiTab-root': {
                color: '#333333',
                '&.Mui-selected': {
                  backgroundColor: '#BFEA7C',
                  color: '#000000',
                  fontWeight: 'bold',
                },
                borderRadius: '4px 4px 0 0',
                margin: '0 2px',
                minHeight: '48px',
              },
              backgroundColor: '#E9F7FB',
            }}
          >
            <Tab label="Personal Info" />
            <Tab label="Qualifications" />
            <Tab label="Dependents" />
            <Tab label="Trainings" />
            <Tab label="Medical Records" />
            <Tab label="Salary" />
            <Tab label="Bank Details" />
            <Tab label="Leaves" />
            <Tab label="Assets" />
          </Tabs>
        </Box>
        
        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Gender
                    </Typography>
                    <Typography variant="body2">
                      {employee.gender || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Marital Status
                    </Typography>
                    <Typography variant="body2">
                      {employee.maritalStatus || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Nationality
                    </Typography>
                    <Typography variant="body2">
                      {employee.nationality || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {employee.address || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      City
                    </Typography>
                    <Typography variant="body2">
                      {employee.city || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      State
                    </Typography>
                    <Typography variant="body2">
                      {employee.state || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Postal Code
                    </Typography>
                    <Typography variant="body2">
                      {employee.postalCode || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Country
                    </Typography>
                    <Typography variant="body2">
                      {employee.country || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Alternate Phone
                    </Typography>
                    <Typography variant="body2">
                      {employee.alternatePhoneNumber || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body2">
                      {employee.emergencyContactName || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Relationship
                    </Typography>
                    <Typography variant="body2">
                      {employee.emergencyContactRelation || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      {employee.emergencyContactPhone || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2">
                  {employee.notes || 'No notes available'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Qualifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Qualifications</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenQualificationDialog}
            >
              Add Qualification
            </Button>
          </Box>
          
          {employee?.qualifications && employee.qualifications.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.qualifications.map((qualification) => (
                    <TableRow key={qualification.id}>
                      <TableCell>{qualification.qualificationType}</TableCell>
                      <TableCell>{qualification.qualificationName}</TableCell>
                      <TableCell>{qualification.institution}</TableCell>
                      <TableCell>{formatDate(qualification.startDate)}</TableCell>
                      <TableCell>{formatDate(qualification.endDate)}</TableCell>
                      <TableCell>{qualification.grade}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Qualification">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditQualification(qualification)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Qualification">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteQualification(qualification.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <SchoolIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No qualifications have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenQualificationDialog}
                color="primary"
              >
                Add First Qualification
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Dependents Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Dependents</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDependentDialog}
            >
              Add Dependent
            </Button>
          </Box>
          
          {employee?.dependents && employee.dependents.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Relation</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>CNIC</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.dependents.map((dependent) => (
                    <TableRow key={dependent.id}>
                      <TableCell>{dependent.name}</TableCell>
                      <TableCell>{dependent.relation}</TableCell>
                      <TableCell>{dependent.contact}</TableCell>
                      <TableCell>{dependent.age}</TableCell>
                      <TableCell>{dependent.gender}</TableCell>
                      <TableCell>{dependent.cnic}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Dependent">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditDependent(dependent)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Dependent">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDependent(dependent.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <PersonIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No dependents have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDependentDialog}
                color="primary"
              >
                Add First Dependent
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Training Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Trainings</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenTrainingDialog}
            >
              Add Training
            </Button>
          </Box>
          
          {employee?.trainings && employee.trainings.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Training Type</TableCell>
                    <TableCell>Training Name</TableCell>
                    <TableCell>Institute</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Certificate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.trainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell>{training.trainingType}</TableCell>
                      <TableCell>{training.trainingName}</TableCell>
                      <TableCell>{training.institute}</TableCell>
                      <TableCell>{training.country}</TableCell>
                      <TableCell>
                        {training.durationFrom && training.durationTo
                          ? `${new Date(training.durationFrom).toLocaleDateString()} - ${new Date(training.durationTo).toLocaleDateString()}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {training.fileUrl ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(training.fileUrl, '_blank')}
                            startIcon={<FileOpenIcon />}
                          >
                            View
                          </Button>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Training">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditTraining(training)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Training">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTraining(training.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <SchoolIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No trainings have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenTrainingDialog}
                color="primary"
              >
                Add First Training
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Medical Records Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Medical Records</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenMedicalRecordDialog}
            >
              Add Medical Record
            </Button>
          </Box>
          
          {employee?.medicalRecords && employee.medicalRecords.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Record Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell>Document</TableCell>
                    <TableCell>Confidential</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.medicalRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.recordType}</TableCell>
                      <TableCell>{formatDate(record.recordDate)}</TableCell>
                      <TableCell>{record.provider || 'N/A'}</TableCell>
                      <TableCell>
                        <Tooltip title={record.description || ''}>
                          <Typography noWrap style={{ maxWidth: 150 }}>
                            {record.description || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {record.followUpRequired ? (
                          <Chip 
                            size="small" 
                            color="primary" 
                            label={formatDate(record.followUpDate)} 
                          />
                        ) : 'No'}
                      </TableCell>
                      <TableCell>
                        {record.documentUrl ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(record.documentUrl, '_blank')}
                            startIcon={<FileOpenIcon />}
                          >
                            View
                          </Button>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.isConfidential ? (
                          <Chip size="small" color="error" label="Yes" />
                        ) : (
                          <Chip size="small" color="default" label="No" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex">
                          <Tooltip title="Edit Record">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditMedicalRecord(record)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteMedicalRecord(record.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <FileIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No medical records have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenMedicalRecordDialog}
                color="primary"
              >
                Add First Medical Record
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Salary Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Salary History</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenSalaryDialog}
            >
              Add Salary Record
            </Button>
          </Box>
          
          {employee?.salaryHistory && employee.salaryHistory.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pay and Allowances</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Salary Slip</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.salaryHistory.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>{salary.payAndAllowances}</TableCell>
                      <TableCell>{salary.totalAmount}</TableCell>
                      <TableCell>{formatDate(salary.createdAt)}</TableCell>
                      <TableCell>
                        {salary.documentUrl ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(salary.documentUrl, '_blank')}
                            startIcon={<FileOpenIcon />}
                          >
                            View
                          </Button>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Salary Record">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSalaryForm({
                                payAndAllowances: salary.payAndAllowances,
                                totalAmount: salary.totalAmount
                              });
                              setEditingSalaryId(salary.id);
                              setSalaryFilePreview(salary.documentUrl || null);
                              setSalaryDialogOpen(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Salary Record">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSalary(salary.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <AttachMoneyIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No salary records have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenSalaryDialog}
                color="primary"
              >
                Add First Salary Record
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Bank Details Tab */}
        <TabPanel value={tabValue} index={6}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Bank Details</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenBankDetailDialog}
            >
              Add Bank Detail
            </Button>
          </Box>
          
          {employee?.bankDetails && employee.bankDetails.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Date Added</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.bankDetails.map((bankDetail) => (
                    <TableRow key={bankDetail.id}>
                      <TableCell>{bankDetail.bankName}</TableCell>
                      <TableCell>{bankDetail.accountNumber}</TableCell>
                      <TableCell>{formatDate(bankDetail.createdAt)}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Bank Detail">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setBankDetailForm({
                                bankName: bankDetail.bankName,
                                accountNumber: bankDetail.accountNumber
                              });
                              setEditingBankDetailId(bankDetail.id);
                              setBankDetailDialogOpen(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Bank Detail">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBankDetail(bankDetail.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <AccountBalanceIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No bank details have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenBankDetailDialog}
                color="primary"
              >
                Add First Bank Detail
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        {/* Leaves Tab */}
        <TabPanel value={tabValue} index={7}>
          <Box display="flex" justifyContent="center" p={3}>
            <Typography variant="body1" color="textSecondary">
              Leave records will be displayed here
            </Typography>
          </Box>
        </TabPanel>
        
        {/* Assets Tab */}
        <TabPanel value={tabValue} index={8}>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Assets</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAssetDialog}
            >
              Add Asset
            </Button>
          </Box>
          
          {employee?.assets && employee.assets.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Type</TableCell>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Declared Date</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.assetType === 'movable' ? 'Movable' : 'Immovable'}</TableCell>
                      <TableCell>{asset.assetName}</TableCell>
                      <TableCell>{formatDate(asset.declaredDate)}</TableCell>
                      <TableCell>{asset.details || 'N/A'}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Asset">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setAssetForm({
                                assetType: asset.assetType,
                                assetName: asset.assetName,
                                declaredDate: asset.declaredDate,
                                details: asset.details || ''
                              });
                              setEditingAssetId(asset.id);
                              setAssetDialogOpen(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Asset">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
              <LaptopIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" color="textSecondary" paragraph>
                No assets have been added yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAssetDialog}
                color="primary"
              >
                Add First Asset
              </Button>
            </Paper>
          )}
        </TabPanel>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {employee.firstName} {employee.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteEmployee} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Profile Image Dialog */}
      <Dialog open={openProfileImageDialog} onClose={() => setOpenProfileImageDialog(false)}>
        <DialogTitle>Update Profile Image</DialogTitle>
        <DialogContent>
          {profileImagePreview && (
            <Box display="flex" justifyContent="center" mt={2}>
              <img 
                src={profileImagePreview} 
                alt="Profile preview" 
                style={{ maxWidth: '100%', maxHeight: '300px' }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileImageDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProfileImage} color="success" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Signature Dialog */}
      <Dialog open={openSignatureDialog} onClose={() => setOpenSignatureDialog(false)}>
        <DialogTitle>Update Signature</DialogTitle>
        <DialogContent>
          {signaturePreview && (
            <Box display="flex" justifyContent="center" mt={2}>
              <img 
                src={signaturePreview} 
                alt="Signature preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSignatureDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSignature} color="success" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dependent Dialog */}
      <Dialog
        open={dependentDialogOpen}
        onClose={() => setDependentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingDependentId ? 'Edit Dependent' : 'Add Dependent'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name"
                fullWidth
                required
                value={dependentForm.name}
                onChange={handleDependentChange}
                error={!!dependentFormErrors.name}
                helperText={dependentFormErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="relation"
                label="Relation"
                select
                fullWidth
                required
                value={dependentForm.relation}
                onChange={handleDependentChange}
                error={!!dependentFormErrors.relation}
                helperText={dependentFormErrors.relation}
              >
                <MenuItem value="Spouse">Spouse</MenuItem>
                <MenuItem value="Child">Child</MenuItem>
                <MenuItem value="Parent">Parent</MenuItem>
                <MenuItem value="Sibling">Sibling</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contact"
                label="Contact"
                fullWidth
                value={dependentForm.contact}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dependentForm.dateOfBirth}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="age"
                label="Age"
                fullWidth
                value={dependentForm.age}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="cnic"
                label="CNIC"
                fullWidth
                value={dependentForm.cnic}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={dependentForm.address}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="nationality"
                label="Nationality"
                fullWidth
                value={dependentForm.nationality}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                select
                fullWidth
                value={dependentForm.gender}
                onChange={handleDependentChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="disease"
                label="Disease (if any)"
                fullWidth
                value={dependentForm.disease}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="disability"
                label="Disability (if any)"
                fullWidth
                value={dependentForm.disability}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Next of Kin Information" />
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="nextOfKin"
                label="Next of Kin"
                fullWidth
                value={dependentForm.nextOfKin}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="nextOfKinRelation"
                label="Next of Kin Relation"
                fullWidth
                value={dependentForm.nextOfKinRelation}
                onChange={handleDependentChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="nextOfKinContact"
                label="Next of Kin Contact"
                fullWidth
                value={dependentForm.nextOfKinContact}
                onChange={handleDependentChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDependentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDependent} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Training Dialog */}
      <Dialog
        open={trainingDialogOpen}
        onClose={() => setTrainingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingTrainingId ? 'Edit Training' : 'Add Training'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="trainingType"
                label="Training Type"
                select
                fullWidth
                required
                value={trainingForm.trainingType}
                onChange={handleTrainingChange}
                error={!!trainingFormErrors.trainingType}
                helperText={trainingFormErrors.trainingType}
              >
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Soft Skills">Soft Skills</MenuItem>
                <MenuItem value="Leadership">Leadership</MenuItem>
                <MenuItem value="Certification">Certification</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="trainingName"
                label="Training Name"
                fullWidth
                required
                value={trainingForm.trainingName}
                onChange={handleTrainingChange}
                error={!!trainingFormErrors.trainingName}
                helperText={trainingFormErrors.trainingName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="institute"
                label="Institute"
                fullWidth
                value={trainingForm.institute}
                onChange={handleTrainingChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="country"
                label="Country"
                fullWidth
                value={trainingForm.country}
                onChange={handleTrainingChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="durationFrom"
                label="Duration From"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={trainingForm.durationFrom}
                onChange={handleTrainingChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="durationTo"
                label="Duration To"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={trainingForm.durationTo}
                onChange={handleTrainingChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
              >
                Upload Certificate
                <input
                  type="file"
                  id="training-file-input"
                  accept="image/*,.pdf"
                  hidden
                  onChange={handleTrainingFileChange}
                />
              </Button>
              
              {trainingFilePreview && (
                <Box mt={2} textAlign="center">
                  {typeof trainingFilePreview === 'string' && trainingFilePreview.endsWith('.pdf') ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 60 }} />
                      <Typography>PDF Document</Typography>
                    </Box>
                  ) : trainingFilePreview.type === 'fileReference' ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <FileIcon color="primary" sx={{ fontSize: 60 }} />
                      <Typography>{trainingFilePreview.name || 'Document'}</Typography>
                    </Box>
                  ) : (
                    <img
                      src={trainingFilePreview}
                      alt="Certificate Preview"
                      style={{ maxHeight: 200, maxWidth: '100%' }}
                    />
                  )}
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setTrainingForm({ ...trainingForm, file: null });
                      setTrainingFilePreview(null);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTraining} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Medical Record Dialog */}
      <Dialog
        open={medicalRecordDialogOpen}
        onClose={() => setMedicalRecordDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingMedicalRecordId ? 'Edit Medical Record' : 'Add Medical Record'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="recordType"
                label="Record Type"
                select
                fullWidth
                required
                value={medicalRecordForm.recordType}
                onChange={handleMedicalRecordChange}
                error={!!medicalRecordFormErrors.recordType}
                helperText={medicalRecordFormErrors.recordType}
              >
                <MenuItem value="Health Check">Health Check</MenuItem>
                <MenuItem value="Vaccination">Vaccination</MenuItem>
                <MenuItem value="Injury">Injury</MenuItem>
                <MenuItem value="Illness">Illness</MenuItem>
                <MenuItem value="Allergy">Allergy</MenuItem>
                <MenuItem value="Medication">Medication</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="recordDate"
                label="Record Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={medicalRecordForm.recordDate}
                onChange={handleMedicalRecordChange}
                error={!!medicalRecordFormErrors.recordDate}
                helperText={medicalRecordFormErrors.recordDate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="expiryDate"
                label="Expiry Date (if applicable)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={medicalRecordForm.expiryDate}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="provider"
                label="Healthcare Provider"
                fullWidth
                value={medicalRecordForm.provider}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={medicalRecordForm.description}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                value={medicalRecordForm.location}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="results"
                label="Results/Outcome"
                fullWidth
                value={medicalRecordForm.results}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={medicalRecordForm.followUpRequired}
                    onChange={handleMedicalRecordChange}
                    name="followUpRequired"
                    color="primary"
                  />
                }
                label="Follow-up Required"
              />
            </Grid>
            
            {medicalRecordForm.followUpRequired && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="followUpDate"
                  label="Follow-up Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={medicalRecordForm.followUpDate}
                  onChange={handleMedicalRecordChange}
                  error={!!medicalRecordFormErrors.followUpDate}
                  helperText={medicalRecordFormErrors.followUpDate}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={medicalRecordForm.notes}
                onChange={handleMedicalRecordChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={medicalRecordForm.isConfidential}
                    onChange={handleMedicalRecordChange}
                    name="isConfidential"
                    color="primary"
                  />
                }
                label="Confidential Record"
              />
              <FormHelperText>
                Confidential records are only visible to HR and Medical Staff
              </FormHelperText>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
              >
                Upload Document
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={handleMedicalRecordFileChange}
                />
              </Button>
              
              {medicalRecordFilePreview && (
                <Box mt={2} textAlign="center">
                  {typeof medicalRecordFilePreview === 'string' && medicalRecordFilePreview.includes('.pdf') ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 60 }} />
                      <Typography>PDF Document</Typography>
                    </Box>
                  ) : medicalRecordFilePreview.type === 'fileReference' ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <FileIcon color="primary" sx={{ fontSize: 60 }} />
                      <Typography>{medicalRecordFilePreview.name || 'Document'}</Typography>
                    </Box>
                  ) : (
                    <img
                      src={medicalRecordFilePreview}
                      alt="Medical Record Document"
                      style={{ maxHeight: 200, maxWidth: '100%' }}
                    />
                  )}
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setMedicalRecordFilePreview(null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMedicalRecordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveMedicalRecord} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Credentials Dialog */}
      <Dialog
        open={credentialsDialogOpen}
        onClose={() => setCredentialsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Credentials</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                value={credentialsForm.username}
                onChange={handleCredentialsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type={credentialsForm.showPassword ? 'text' : 'password'}
                fullWidth
                value={credentialsForm.password}
                onChange={handleCredentialsChange}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {credentialsForm.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCredentialsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCredentials} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button 
          startIcon={<FileDownloadIcon />} 
          onClick={exportEmployeeData}
          variant="outlined"
          color="primary"
        >
          Export Data
        </Button>
        <Button
          component={RouterLink}
          to={`/employees/${id}/edit`}
          variant="contained"
          color="success"
          startIcon={<EditIcon />}
          disabled={!hasRole('hr')}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpenDeleteDialog(true)}
          disabled={!hasRole('hr')}
        >
          Delete
        </Button>
      </Box>
      
      {/* Qualification Dialog */}
      <Dialog 
        open={qualificationDialogOpen} 
        onClose={() => setQualificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingQualificationId ? 'Edit Qualification' : 'Add Qualification'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="qualificationType"
                label="Qualification Type"
                select
                fullWidth
                required
                value={qualificationForm.qualificationType}
                onChange={handleQualificationChange}
                error={!!qualificationFormErrors.qualificationType}
                helperText={qualificationFormErrors.qualificationType}
              >
                <MenuItem value="Degree">Degree</MenuItem>
                <MenuItem value="Certificate">Certificate</MenuItem>
                <MenuItem value="License">License</MenuItem>
                <MenuItem value="Course">Course</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="qualificationName"
                label="Qualification Name"
                fullWidth
                required
                value={qualificationForm.qualificationName}
                onChange={handleQualificationChange}
                error={!!qualificationFormErrors.qualificationName}
                helperText={qualificationFormErrors.qualificationName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="institution"
                label="Institution"
                fullWidth
                required
                value={qualificationForm.institution}
                onChange={handleQualificationChange}
                error={!!qualificationFormErrors.institution}
                helperText={qualificationFormErrors.institution}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={qualificationForm.startDate}
                onChange={handleQualificationChange}
                error={!!qualificationFormErrors.startDate}
                helperText={qualificationFormErrors.startDate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={qualificationForm.endDate}
                onChange={handleQualificationChange}
                error={!!qualificationFormErrors.endDate}
                helperText={qualificationFormErrors.endDate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="grade"
                label="Grade/CGPA"
                fullWidth
                value={qualificationForm.grade}
                onChange={handleQualificationChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={qualificationForm.description}
                onChange={handleQualificationChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
              >
                Upload Document
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={handleQualificationFileChange}
                />
              </Button>
              
              {qualificationFilePreview && (
                <Box mt={2} textAlign="center">
                  {typeof qualificationFilePreview === 'string' && qualificationFilePreview.includes('.pdf') ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 60 }} />
                      <Typography>PDF Document</Typography>
                    </Box>
                  ) : qualificationFilePreview.type === 'fileReference' ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <FileIcon color="primary" sx={{ fontSize: 60 }} />
                      <Typography>{qualificationFilePreview.name || 'Document'}</Typography>
                    </Box>
                  ) : (
                    <img
                      src={qualificationFilePreview}
                      alt="Qualification Document"
                      style={{ maxHeight: 200, maxWidth: '100%' }}
                    />
                  )}
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setQualificationFilePreview(null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualificationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQualification} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Salary Dialog */}
      <Dialog
        open={salaryDialogOpen}
        onClose={() => setSalaryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingSalaryId ? 'Edit Salary Record' : 'Add Salary Record'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="payAndAllowances"
                label="Pay and Allowances"
                fullWidth
                required
                value={salaryForm.payAndAllowances}
                onChange={handleSalaryChange}
                error={!!salaryFormErrors.payAndAllowances}
                helperText={salaryFormErrors.payAndAllowances}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="totalAmount"
                label="Total Amount"
                fullWidth
                required
                value={salaryForm.totalAmount}
                onChange={handleSalaryChange}
                error={!!salaryFormErrors.totalAmount}
                helperText={salaryFormErrors.totalAmount}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
              >
                Upload Salary Slip
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={handleSalaryFileChange}
                />
              </Button>
              
              {salaryFilePreview && (
                <Box mt={2} textAlign="center">
                  {typeof salaryFilePreview === 'string' && salaryFilePreview.includes('.pdf') ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 60 }} />
                      <Typography>PDF Document</Typography>
                    </Box>
                  ) : typeof salaryFilePreview === 'object' && salaryFilePreview.type === 'fileReference' ? (
                    <Box border={1} borderColor="divider" p={2}>
                      <FileIcon color="primary" sx={{ fontSize: 60 }} />
                      <Typography>{salaryFilePreview.name || 'Document'}</Typography>
                    </Box>
                  ) : (
                    <img
                      src={salaryFilePreview}
                      alt="Salary Slip"
                      style={{ maxHeight: 200, maxWidth: '100%' }}
                    />
                  )}
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setSalaryFilePreview(null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalaryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSalary} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bank Details Dialog */}
      <Dialog
        open={bankDetailDialogOpen}
        onClose={() => setBankDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingBankDetailId ? 'Edit Bank Detail' : 'Add Bank Detail'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="bankName"
                label="Bank Name"
                fullWidth
                required
                value={bankDetailForm.bankName}
                onChange={handleBankDetailChange}
                error={!!bankDetailFormErrors.bankName}
                helperText={bankDetailFormErrors.bankName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="accountNumber"
                label="Account Number"
                fullWidth
                required
                value={bankDetailForm.accountNumber}
                onChange={handleBankDetailChange}
                error={!!bankDetailFormErrors.accountNumber}
                helperText={bankDetailFormErrors.accountNumber}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDetailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveBankDetail} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Asset Dialog */}
      <Dialog
        open={assetDialogOpen}
        onClose={() => setAssetDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingAssetId ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assetType"
                label="Asset Type"
                fullWidth
                required
                value={assetForm.assetType}
                onChange={handleAssetChange}
                error={!!assetFormErrors.assetType}
                helperText={assetFormErrors.assetType}
              >
                <MenuItem value="movable">Movable</MenuItem>
                <MenuItem value="immovable">Immovable</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="assetName"
                label="Asset Name"
                fullWidth
                required
                value={assetForm.assetName}
                onChange={handleAssetChange}
                error={!!assetFormErrors.assetName}
                helperText={assetFormErrors.assetName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="declaredDate"
                label="Declared Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={assetForm.declaredDate}
                onChange={handleAssetChange}
                error={!!assetFormErrors.declaredDate}
                helperText={assetFormErrors.declaredDate}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="details"
                label="Details"
                fullWidth
                multiline
                rows={2}
                value={assetForm.details}
                onChange={handleAssetChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAsset} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetails; 