import axios from 'axios';
import apiConfig, { API_BASE_URL } from '../config/api';
import { getStoredEmployees, storeCompressedEmployees } from '../utils/storageUtils';

// Get all medical records for an employee
export const getMedicalRecords = async (employeeId) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return getMedicalRecordsFromLocalStorage(employeeId);
    }
    
    // Otherwise use API
    const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}/medical-records`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    
    // Fallback to localStorage if API fails
    try {
      return getMedicalRecordsFromLocalStorage(employeeId);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Get a single medical record
export const getMedicalRecord = async (employeeId, recordId) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return getMedicalRecordFromLocalStorage(employeeId, recordId);
    }
    
    // Otherwise use API
    const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}/medical-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical record:', error);
    
    // Fallback to localStorage if API fails
    try {
      return getMedicalRecordFromLocalStorage(employeeId, recordId);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Create a new medical record
export const createMedicalRecord = async (employeeId, medicalRecordData) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return createMedicalRecordInLocalStorage(employeeId, medicalRecordData);
    }
    
    // Otherwise use API
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append document file if exists
    if (medicalRecordData.documentFile) {
      formData.append('document', medicalRecordData.documentFile);
    }
    
    // Append all other fields
    Object.keys(medicalRecordData).forEach(key => {
      if (key !== 'documentFile' && medicalRecordData[key] !== undefined) {
        formData.append(key, medicalRecordData[key]);
      }
    });
    
    const response = await axios.post(
      `${API_BASE_URL}/employees/${employeeId}/medical-records`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    
    // Fallback to localStorage if API fails
    try {
      return createMedicalRecordInLocalStorage(employeeId, medicalRecordData);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Update an existing medical record
export const updateMedicalRecord = async (employeeId, recordId, medicalRecordData) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return updateMedicalRecordInLocalStorage(employeeId, recordId, medicalRecordData);
    }
    
    // Otherwise use API
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append document file if exists
    if (medicalRecordData.documentFile) {
      formData.append('document', medicalRecordData.documentFile);
    }
    
    // Append all other fields
    Object.keys(medicalRecordData).forEach(key => {
      if (key !== 'documentFile' && medicalRecordData[key] !== undefined) {
        formData.append(key, medicalRecordData[key]);
      }
    });
    
    const response = await axios.put(
      `${API_BASE_URL}/employees/${employeeId}/medical-records/${recordId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating medical record:', error);
    
    // Fallback to localStorage if API fails
    try {
      return updateMedicalRecordInLocalStorage(employeeId, recordId, medicalRecordData);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (employeeId, recordId) => {
  try {
    // If in demo mode, use localStorage
    if (apiConfig.isDemoMode()) {
      return deleteMedicalRecordFromLocalStorage(employeeId, recordId);
    }
    
    // Otherwise use API
    const response = await axios.delete(`${API_BASE_URL}/employees/${employeeId}/medical-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    
    // Fallback to localStorage if API fails
    try {
      return deleteMedicalRecordFromLocalStorage(employeeId, recordId);
    } catch (fallbackError) {
      throw error; // If fallback also fails, throw the original error
    }
  }
};

// Helper functions for localStorage operations
const getMedicalRecordsFromLocalStorage = (employeeId) => {
  const storedEmployees = getStoredEmployees();
  const employee = storedEmployees.find(emp => emp.id.toString() === employeeId.toString());
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  return employee.medicalRecords || [];
};

const getMedicalRecordFromLocalStorage = (employeeId, recordId) => {
  const medicalRecords = getMedicalRecordsFromLocalStorage(employeeId);
  const record = medicalRecords.find(record => record.id.toString() === recordId.toString());
  
  if (!record) {
    throw new Error('Medical record not found');
  }
  
  return record;
};

const createMedicalRecordInLocalStorage = (employeeId, medicalRecordData) => {
  const storedEmployees = getStoredEmployees();
  const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === employeeId.toString());
  
  if (employeeIndex === -1) {
    throw new Error('Employee not found');
  }
  
  // Ensure the employee has a medicalRecords array
  if (!storedEmployees[employeeIndex].medicalRecords) {
    storedEmployees[employeeIndex].medicalRecords = [];
  }
  
  // Create a new medical record
  const newMedicalRecord = {
    id: Date.now(), // Use timestamp as ID for demo
    ...medicalRecordData,
    documentUrl: medicalRecordData.documentFile || null, // Store the document
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add the new record to the array
  storedEmployees[employeeIndex].medicalRecords.push(newMedicalRecord);
  
  // Update the updatedAt timestamp for the employee
  storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
  
  // Save to localStorage
  storeCompressedEmployees(storedEmployees);
  
  return newMedicalRecord;
};

const updateMedicalRecordInLocalStorage = (employeeId, recordId, medicalRecordData) => {
  const storedEmployees = getStoredEmployees();
  const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === employeeId.toString());
  
  if (employeeIndex === -1) {
    throw new Error('Employee not found');
  }
  
  if (!storedEmployees[employeeIndex].medicalRecords) {
    throw new Error('Medical records not found for this employee');
  }
  
  // Find the record index
  const recordIndex = storedEmployees[employeeIndex].medicalRecords.findIndex(
    record => record.id.toString() === recordId.toString()
  );
  
  if (recordIndex === -1) {
    throw new Error('Medical record not found');
  }
  
  // Update the medical record
  const updatedRecord = {
    ...storedEmployees[employeeIndex].medicalRecords[recordIndex],
    ...medicalRecordData,
    documentUrl: medicalRecordData.documentFile || storedEmployees[employeeIndex].medicalRecords[recordIndex].documentUrl,
    updatedAt: new Date().toISOString()
  };
  
  // Replace the record in the array
  storedEmployees[employeeIndex].medicalRecords[recordIndex] = updatedRecord;
  
  // Update the updatedAt timestamp for the employee
  storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
  
  // Save to localStorage
  storeCompressedEmployees(storedEmployees);
  
  return updatedRecord;
};

const deleteMedicalRecordFromLocalStorage = (employeeId, recordId) => {
  const storedEmployees = getStoredEmployees();
  const employeeIndex = storedEmployees.findIndex(emp => emp.id.toString() === employeeId.toString());
  
  if (employeeIndex === -1) {
    throw new Error('Employee not found');
  }
  
  if (!storedEmployees[employeeIndex].medicalRecords) {
    throw new Error('Medical records not found for this employee');
  }
  
  // Filter out the record to delete
  const updatedMedicalRecords = storedEmployees[employeeIndex].medicalRecords.filter(
    record => record.id.toString() !== recordId.toString()
  );
  
  // Update the employee
  storedEmployees[employeeIndex].medicalRecords = updatedMedicalRecords;
  storedEmployees[employeeIndex].updatedAt = new Date().toISOString();
  
  // Save to localStorage
  storeCompressedEmployees(storedEmployees);
  
  return { message: 'Medical record deleted successfully' };
}; 