import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StorageIcon from '@mui/icons-material/Storage';
import DatabaseIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearIcon from '@mui/icons-material/Clear';
import apiConfig from '../../config/api';
import { migrateLocalStorageToDatabase, checkForMigrationNeeded, clearLocalStorageData } from '../../utils/migrationUtils';
import { getStoredEmployees, checkStorageSpace } from '../../utils/storageUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import PropTypes from 'prop-types';

const steps = ['Check Data', 'Migrate to Database', 'Verify Migration', 'Clear Browser Storage'];

const DataMigrationTool = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrationDetails, setMigrationDetails] = useState([]);
  const [databaseStatus, setDatabaseStatus] = useState(null);

  // Step 1: Check localStorage data
  useEffect(() => {
    if (activeStep === 0) {
      checkLocalStorage();
    }
  }, [activeStep]);

  const checkLocalStorage = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get storage info
      const storageSpace = checkStorageSpace();
      
      // Check for data to migrate
      const migrationCheck = checkForMigrationNeeded();
      
      // Get detailed info about employees and their data
      const employees = getStoredEmployees();
      const employeeDetails = employees.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        qualifications: emp.qualifications?.length || 0,
        dependents: emp.dependents?.length || 0,
        trainings: emp.trainings?.length || 0,
        medicalRecords: emp.medicalRecords?.length || 0
      }));
      
      setStorageInfo({
        space: storageSpace,
        migrationNeeded: migrationCheck.needed,
        employeeCount: migrationCheck.count,
        employeeDetails
      });
      
      setLoading(false);
    } catch (err) {
      setError(`Error checking localStorage: ${err.message}`);
      setLoading(false);
    }
  };

  // Step 2: Migrate data to SQLite
  const handleMigration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Set API mode to production
      apiConfig.setApiMode('production');
      
      // Start migration
      const result = await migrateLocalStorageToDatabase();
      
      setMigrationStatus(result);
      if (result.details) {
        setMigrationDetails(result.details);
      }
      
      if (result.success) {
        // If successful, automatically move to next step
        handleNext();
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Migration failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Step 3: Verify migration
  const verifyMigration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the backend to get current database counts
      const response = await axios.get(`${API_BASE_URL}/migration/status`);
      
      if (response.data && response.data.status === 'success') {
        setDatabaseStatus(response.data.data);
        // If data looks good, automatically move to next step
        handleNext();
      } else {
        setError('Failed to verify migration');
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Verification failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Step 4: Clear localStorage
  const clearStorage = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear localStorage data but keep important settings
      clearLocalStorageData();
      
      // Check if it worked
      const migrationCheck = checkForMigrationNeeded();
      
      if (!migrationCheck.needed) {
        // Complete the migration process
        setActiveStep(steps.length);
        if (onComplete) onComplete();
      } else {
        setError('Failed to clear localStorage completely');
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Error clearing localStorage: ${err.message}`);
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Check Browser Storage Data
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : storageInfo ? (
              <>
                <Alert 
                  severity={storageInfo.space.percentUsed > 80 ? "warning" : "info"} 
                  sx={{ mb: 2 }}
                >
                  Browser storage is {storageInfo.space.percentUsed}% full 
                  ({storageInfo.space.used}MB used of {storageInfo.space.total}MB)
                </Alert>
                
                {storageInfo.migrationNeeded ? (
                  <>
                    <Typography variant="body1" gutterBottom>
                      Found {storageInfo.employeeCount} employees to migrate to the database.
                    </Typography>
                    
                    {storageInfo.employeeDetails.length > 0 && (
                      <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {storageInfo.employeeDetails.map(emp => (
                            <ListItem key={emp.id}>
                              <ListItemIcon>
                                <StorageIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary={emp.name} 
                                secondary={`Qualifications: ${emp.qualifications}, Dependents: ${emp.dependents}, Trainings: ${emp.trainings}, Medical Records: ${emp.medicalRecords}`} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleNext} 
                      sx={{ mt: 3 }}
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  <Alert severity="success">
                    No data found in browser storage that needs migration.
                  </Alert>
                )}
              </>
            ) : null}
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Migrate Data to SQLite Database
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              This process will move all your employee data from browser storage to the SQLite database.
              Please do not close the browser during migration.
            </Alert>
            
            {loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" my={3}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Migrating data... This may take a few minutes
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : migrationStatus ? (
              <Alert severity={migrationStatus.success ? "success" : "warning"} sx={{ my: 2 }}>
                {migrationStatus.message}
              </Alert>
            ) : (
              <Button 
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleMigration}
                fullWidth
                sx={{ my: 2 }}
              >
                Start Migration
              </Button>
            )}
            
            {migrationDetails.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {migrationDetails.map((detail, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {detail.status === 'success' ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Employee ID: ${detail.employeeId}`} 
                        secondary={detail.status === 'success' ? `New ID: ${detail.newId}` : `Error: ${detail.error}`} 
                      />
                      <Chip 
                        label={detail.status} 
                        color={detail.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Migration
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : databaseStatus ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Migration verification complete!
                </Alert>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Database now contains:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><DatabaseIcon /></ListItemIcon>
                      <ListItemText primary={`${databaseStatus.employees} Employees`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DatabaseIcon /></ListItemIcon>
                      <ListItemText primary={`${databaseStatus.qualifications} Qualifications`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DatabaseIcon /></ListItemIcon>
                      <ListItemText primary={`${databaseStatus.dependents} Dependents`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DatabaseIcon /></ListItemIcon>
                      <ListItemText primary={`${databaseStatus.trainings} Trainings`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DatabaseIcon /></ListItemIcon>
                      <ListItemText primary={`${databaseStatus.medicalRecords} Medical Records`} />
                    </ListItem>
                  </List>
                </Paper>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleNext} 
                  sx={{ mt: 3 }}
                >
                  Continue
                </Button>
              </>
            ) : (
              <Button 
                variant="contained"
                color="primary"
                onClick={verifyMigration}
                fullWidth
              >
                Verify Migration
              </Button>
            )}
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Clear Browser Storage
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              Now that your data has been migrated to the database, we can clear the browser storage to free up space.
              This will not delete your data from the database.
            </Alert>
            
            {loading ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : (
              <Button 
                variant="contained"
                color="error"
                startIcon={<ClearIcon />}
                onClick={clearStorage}
                fullWidth
                sx={{ my: 2 }}
              >
                Clear Browser Storage
              </Button>
            )}
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Data Migration Tool
      </Typography>
      
      <Typography variant="body1" align="center" paragraph>
        Move your data from browser storage to SQLite database
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Migration complete! Your data has been successfully moved to the SQLite database.
          </Alert>
          <Typography variant="body1" gutterBottom>
            All your employee data is now stored in the database instead of browser storage.
            The application will now use the database for all operations.
          </Typography>
        </Box>
      ) : (
        getStepContent(activeStep)
      )}
    </Paper>
  );
};

DataMigrationTool.propTypes = {
  onComplete: PropTypes.func
};

export default DataMigrationTool; 