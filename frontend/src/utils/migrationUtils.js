import axios from 'axios';
import { getStoredEmployees } from './storageUtils';
import { API_BASE_URL } from '../config/api';

/**
 * Migrates all data from localStorage to the backend SQLite database
 * @returns {Promise<{success: boolean, message: string, migratedCount: number}>}
 */
export const migrateLocalStorageToDatabase = async () => {
  try {
    // Get all employees from localStorage
    const employees = getStoredEmployees();
    
    if (!employees || employees.length === 0) {
      return {
        success: false,
        message: 'No data found in localStorage to migrate',
        migratedCount: 0
      };
    }
    
    // Create an array to track migration results
    const migrationResults = [];
    
    // Set up migration status
    const migrationStatus = {
      total: employees.length,
      completed: 0,
      failed: 0
    };
    
    // Migrate each employee and their associated data
    for (const employee of employees) {
      try {
        // Format employee data for API
        const employeeData = { ...employee };
        
        // Remove associated data that will be migrated separately
        const qualifications = employeeData.qualifications || [];
        const dependents = employeeData.dependents || [];
        const trainings = employeeData.trainings || [];
        const medicalRecords = employeeData.medicalRecords || [];
        
        delete employeeData.qualifications;
        delete employeeData.dependents;
        delete employeeData.trainings;
        delete employeeData.medicalRecords;
        
        // Save the employee
        const createdEmployee = await axios.post(`${API_BASE_URL}/employees/migrate`, employeeData);
        
        if (createdEmployee.data && createdEmployee.data.id) {
          const employeeId = createdEmployee.data.id;
          
          // Migrate qualifications
          if (qualifications.length > 0) {
            await axios.post(`${API_BASE_URL}/qualifications/bulk-migrate`, {
              employeeId,
              qualifications
            });
          }
          
          // Migrate dependents
          if (dependents.length > 0) {
            await axios.post(`${API_BASE_URL}/dependents/bulk-migrate`, {
              employeeId,
              dependents
            });
          }
          
          // Migrate trainings
          if (trainings.length > 0) {
            await axios.post(`${API_BASE_URL}/trainings/bulk-migrate`, {
              employeeId,
              trainings
            });
          }
          
          // Migrate medical records
          if (medicalRecords.length > 0) {
            await axios.post(`${API_BASE_URL}/medical-records/bulk-migrate`, {
              employeeId,
              medicalRecords
            });
          }
          
          migrationResults.push({
            employeeId: employee.id,
            newId: employeeId,
            status: 'success'
          });
          
          migrationStatus.completed++;
        }
      } catch (error) {
        console.error(`Error migrating employee ${employee.id}:`, error);
        migrationResults.push({
          employeeId: employee.id,
          status: 'failed',
          error: error.message
        });
        
        migrationStatus.failed++;
      }
    }
    
    // If all migrations were successful, clear localStorage
    if (migrationStatus.failed === 0) {
      // Keep the apiMode setting but clear employee data
      const apiMode = localStorage.getItem('apiMode');
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Clear localStorage
      localStorage.clear();
      
      // Restore important settings
      if (apiMode) localStorage.setItem('apiMode', 'production'); // Force production mode
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      
      return {
        success: true,
        message: `Successfully migrated all ${migrationStatus.completed} employees to the database`,
        migratedCount: migrationStatus.completed,
        details: migrationResults
      };
    } else {
      return {
        success: false,
        message: `Migration partially completed. ${migrationStatus.completed} succeeded, ${migrationStatus.failed} failed.`,
        migratedCount: migrationStatus.completed,
        failedCount: migrationStatus.failed,
        details: migrationResults
      };
    }
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      migratedCount: 0
    };
  }
};

/**
 * Clears localStorage data after confirmation of successful database storage
 */
export const clearLocalStorageData = () => {
  // Keep the apiMode setting but clear employee data
  const apiMode = localStorage.getItem('apiMode');
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // Clear localStorage
  localStorage.clear();
  
  // Restore important settings
  if (apiMode) localStorage.setItem('apiMode', 'production'); // Force production mode
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', user);
  
  return true;
};

/**
 * Checks if there is data in localStorage that needs migration
 */
export const checkForMigrationNeeded = () => {
  const employees = getStoredEmployees();
  return {
    needed: employees && employees.length > 0,
    count: employees ? employees.length : 0
  };
}; 