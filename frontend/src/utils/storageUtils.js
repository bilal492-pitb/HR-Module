import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

// Maximum size for file attachments in bytes (500KB default)
const MAX_FILE_SIZE = 500 * 1024;

// File processing utility - resizes and compresses images before storing
export const processFileForStorage = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    maxSizeBytes = MAX_FILE_SIZE
  } = options;

  // If file is too large or not an image, return a placeholder
  if (!file) {
    return null;
  }

  // Check file size first
  if (file.size > maxSizeBytes) {
    console.warn(`File too large (${Math.round(file.size/1024)}KB), max allowed is ${Math.round(maxSizeBytes/1024)}KB`);
    
    // If it's an image, try to resize it
    if (file.type.startsWith('image/')) {
      return await resizeImage(file, maxWidth, maxHeight, quality, maxSizeBytes);
    } else {
      // For non-images, return a reference object instead of the actual file
      return {
        type: 'fileReference',
        name: file.name,
        size: file.size,
        fileType: file.type,
        tooLarge: true
      };
    }
  }

  // For small enough files, we can store them directly
  if (file.type.startsWith('image/')) {
    return await fileToDataUrl(file);
  } else {
    // For PDF or other files, just store a reference 
    return {
      type: 'fileReference',
      name: file.name,
      size: file.size,
      fileType: file.type
    };
  }
};

// Resize image to fit within storage limits
const resizeImage = (file, maxWidth, maxHeight, quality, maxSizeBytes) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the resized image
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL and check size
        let dataUrl = canvas.toDataURL(file.type, quality);
        
        // Continue reducing quality if still too large
        const dataSize = new Blob([dataUrl]).size;
        
        if (dataSize > maxSizeBytes) {
          // If still too large even after initial resize, create a reference object
          resolve({
            type: 'fileReference',
            name: file.name,
            size: file.size,
            fileType: file.type,
            resizedSize: Math.round(dataSize/1024) + 'KB',
            tooLarge: true
          });
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

// Convert file to data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Enhanced compression for employee data
export const storeCompressedEmployees = (employees) => {
  try {
    // Before compressing, optimize file data
    const optimizedEmployees = employees.map(employee => {
      // Create a copy to avoid modifying the original object
      const optimizedEmployee = { ...employee };
      
      // Optimize profile picture if present
      if (typeof optimizedEmployee.profilePicture === 'string' && 
          optimizedEmployee.profilePicture.length > MAX_FILE_SIZE) {
        optimizedEmployee.profilePicture = {
          type: 'fileReference',
          truncated: true,
          originalSize: optimizedEmployee.profilePicture.length
        };
      }
      
      // Optimize qualifications files
      if (optimizedEmployee.qualifications && Array.isArray(optimizedEmployee.qualifications)) {
        optimizedEmployee.qualifications = optimizedEmployee.qualifications.map(qual => {
          const optimizedQual = { ...qual };
          if (typeof optimizedQual.documentUrl === 'string' && 
              optimizedQual.documentUrl.length > MAX_FILE_SIZE) {
            optimizedQual.documentUrl = {
              type: 'fileReference',
              truncated: true,
              originalSize: optimizedQual.documentUrl.length
            };
          }
          return optimizedQual;
        });
      }
      
      // Optimize training files
      if (optimizedEmployee.trainings && Array.isArray(optimizedEmployee.trainings)) {
        optimizedEmployee.trainings = optimizedEmployee.trainings.map(training => {
          const optimizedTraining = { ...training };
          if (typeof optimizedTraining.certificateUrl === 'string' && 
              optimizedTraining.certificateUrl.length > MAX_FILE_SIZE) {
            optimizedTraining.certificateUrl = {
              type: 'fileReference',
              truncated: true,
              originalSize: optimizedTraining.certificateUrl.length
            };
          }
          return optimizedTraining;
        });
      }
      
      // Optimize medical records
      if (optimizedEmployee.medicalRecords && Array.isArray(optimizedEmployee.medicalRecords)) {
        optimizedEmployee.medicalRecords = optimizedEmployee.medicalRecords.map(record => {
          const optimizedRecord = { ...record };
          if (typeof optimizedRecord.documentUrl === 'string' && 
              optimizedRecord.documentUrl.length > MAX_FILE_SIZE) {
            optimizedRecord.documentUrl = {
              type: 'fileReference',
              truncated: true,
              originalSize: optimizedRecord.documentUrl.length
            };
          }
          return optimizedRecord;
        });
      }
      
      return optimizedEmployee;
    });
    
    // Compress and store the data
    const employeesString = JSON.stringify(optimizedEmployees);
    const compressedData = compressToUTF16(employeesString);
    localStorage.setItem('employees_compressed', compressedData);
    
    // Also store a timestamp for cache validation
    localStorage.setItem('employees_last_updated', Date.now().toString());
    
    return true;
  } catch (e) {
    console.error('Error compressing employee data:', e);
    // Fallback to regular storage if compression fails
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
      return false;
    } catch (storageError) {
      console.error('Storage quota exceeded:', storageError);
      throw new Error('Storage quota exceeded. Please remove some attachments or clear storage.');
    }
  }
};

// Get employees with decompression
export const getStoredEmployees = () => {
  try {
    // Try to get compressed data first
    const compressedData = localStorage.getItem('employees_compressed');
    if (compressedData) {
      const decompressedData = decompressFromUTF16(compressedData);
      return JSON.parse(decompressedData);
    }
    
    // Fallback to uncompressed data
    return JSON.parse(localStorage.getItem('employees') || '[]');
  } catch (e) {
    console.error('Error retrieving employee data:', e);
    return [];
  }
};

// Calculate storage space used and available
export const checkStorageSpace = () => {
  let totalSize = 0;
  let localStorageSize = 0;
  
  try {
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += (localStorage[key].length * 2) / 1024 / 1024; // Size in MB
      }
    }
    
    // Determine browser storage limit (varies by browser, but most modern browsers provide at least 5MB)
    localStorageSize = 5; // Conservative default
    
    // Some browsers expose the quota API
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        localStorageSize = estimate.quota / (1024 * 1024);
      });
    }
    
    return {
      used: totalSize.toFixed(2),
      total: localStorageSize,
      available: (localStorageSize - totalSize).toFixed(2),
      percentUsed: ((totalSize / localStorageSize) * 100).toFixed(1)
    };
  } catch (e) {
    console.error('Error calculating storage size:', e);
    return {
      used: 0,
      total: localStorageSize,
      available: localStorageSize,
      percentUsed: 0
    };
  }
};

// Clean up storage by removing large files
export const cleanupStorage = (options = {}) => {
  const {
    removeImages = true,
    removeDocuments = true,
    optimizeStorage = true
  } = options;
  
  try {
    const allEmployees = getStoredEmployees();
    let modifiedCount = 0;
    
    // Create a deep copy of the employees array and optimize
    const optimizedEmployees = allEmployees.map(emp => {
      const employee = { ...emp };
      let modified = false;
      
      // Remove profile images if option selected
      if (removeImages && employee.profilePicture) {
        delete employee.profilePicture;
        modified = true;
      }
      
      // Remove document URLs if option selected
      if (removeDocuments) {
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
    if (optimizeStorage || modifiedCount > 0) {
      storeCompressedEmployees(optimizedEmployees);
      
      // Clear the uncompressed version if we're optimizing storage
      if (optimizeStorage) {
        localStorage.removeItem('employees');
      }
    }
    
    return {
      success: true,
      modifiedCount
    };
  } catch (err) {
    console.error('Error cleaning up storage:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// Export current storage stats
export const getStorageStats = () => {
  const spaceInfo = checkStorageSpace();
  
  // Count files and their sizes
  const employees = getStoredEmployees();
  let fileCount = 0;
  let totalFileSize = 0;
  
  // Count profile pictures
  employees.forEach(emp => {
    if (emp.profilePicture) {
      fileCount++;
      if (typeof emp.profilePicture === 'string') {
        totalFileSize += emp.profilePicture.length;
      }
    }
    
    // Count qualification files
    if (emp.qualifications) {
      emp.qualifications.forEach(qual => {
        if (qual.documentUrl) {
          fileCount++;
          if (typeof qual.documentUrl === 'string') {
            totalFileSize += qual.documentUrl.length;
          }
        }
      });
    }
    
    // Count training files
    if (emp.trainings) {
      emp.trainings.forEach(training => {
        if (training.certificateUrl) {
          fileCount++;
          if (typeof training.certificateUrl === 'string') {
            totalFileSize += training.certificateUrl.length;
          }
        }
      });
    }
    
    // Count medical record files
    if (emp.medicalRecords) {
      emp.medicalRecords.forEach(record => {
        if (record.documentUrl) {
          fileCount++;
          if (typeof record.documentUrl === 'string') {
            totalFileSize += record.documentUrl.length;
          }
        }
      });
    }
  });
  
  return {
    ...spaceInfo,
    fileCount,
    totalFileSize: (totalFileSize / (1024 * 1024)).toFixed(2) + 'MB',
    employeeCount: employees.length
  };
}; 