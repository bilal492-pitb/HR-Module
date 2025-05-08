const db = require('../models');
const Employee = db.Employee;
const Qualification = db.Qualification;
const Dependent = db.Dependent;
const Training = db.Training;
const MedicalRecord = db.MedicalRecord;
// const { handleFileUpload } = require('../utils/fileHelper'); // Disabled: fileHelper not found
const fs = require('fs');
const path = require('path');

// Migrate an employee from localStorage to database
exports.migrateEmployee = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const employeeData = req.body;
    
    // Check if employee with the same ID already exists
    const existingEmployee = await Employee.findOne({
      where: { employeeId: employeeData.employeeId || employeeData.id }
    });
    
    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee with this ID already exists",
        existingId: existingEmployee.id
      });
    }
    
    // Handle profile picture if it's a base64 string
    if (employeeData.profilePicture && employeeData.profilePicture.startsWith('data:')) {
      try {
        // Extract the base64 data
        const matches = employeeData.profilePicture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const type = matches[1];
          const data = matches[2];
          const buffer = Buffer.from(data, 'base64');
          
          // Generate a filename
          const ext = type.split('/')[1];
          const filename = `profile_${Date.now()}.${ext}`;
          const uploadDir = path.join(__dirname, '../../uploads/profiles');
          
          // Ensure directory exists
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          // Save the file
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, buffer);
          
          // Update the profile picture URL
          employeeData.profilePicture = `/uploads/profiles/${filename}`;
        }
      } catch (fileError) {
        console.error('Error processing profile picture:', fileError);
        // Continue without the profile picture if there's an error
        delete employeeData.profilePicture;
      }
    }
    
    // Create the employee in the database
    const employee = await Employee.create(employeeData, { transaction: t });
    
    await t.commit();
    
    res.status(201).json(employee);
  } catch (err) {
    await t.rollback();
    console.error('Error in migrateEmployee:', err);
    
    res.status(500).json({
      message: "Error migrating employee",
      error: err.message
    });
  }
};

// Bulk migrate qualifications
exports.migrateQualifications = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { employeeId, qualifications } = req.body;
    
    // Validate data
    if (!employeeId || !qualifications || !Array.isArray(qualifications)) {
      return res.status(400).json({
        message: "Invalid data format. employeeId and qualifications array required."
      });
    }
    
    // Find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    // Process and create each qualification
    const createdQualifications = [];
    
    for (const qualification of qualifications) {
      // Handle document if it's a base64 string
      if (qualification.documentUrl && qualification.documentUrl.startsWith('data:')) {
        try {
          // Process similar to profile picture
          const matches = qualification.documentUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const type = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            
            const ext = type.split('/')[1];
            const filename = `qualification_${Date.now()}_${createdQualifications.length}.${ext}`;
            const uploadDir = path.join(__dirname, '../../uploads/qualifications');
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            
            qualification.documentUrl = `/uploads/qualifications/${filename}`;
          }
        } catch (fileError) {
          console.error('Error processing qualification document:', fileError);
          delete qualification.documentUrl;
        }
      }
      
      const qualificationData = {
        ...qualification,
        employeeId: employee.id
      };
      
      const createdQualification = await Qualification.create(qualificationData, { transaction: t });
      createdQualifications.push(createdQualification);
    }
    
    await t.commit();
    
    res.status(201).json({
      message: `${createdQualifications.length} qualifications migrated successfully`,
      data: createdQualifications
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in migrateQualifications:', err);
    
    res.status(500).json({
      message: "Error migrating qualifications",
      error: err.message
    });
  }
};

// Bulk migrate dependents
exports.migrateDependents = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { employeeId, dependents } = req.body;
    
    // Validate data
    if (!employeeId || !dependents || !Array.isArray(dependents)) {
      return res.status(400).json({
        message: "Invalid data format. employeeId and dependents array required."
      });
    }
    
    // Find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    // Process and create each dependent
    const createdDependents = [];
    
    for (const dependent of dependents) {
      const dependentData = {
        ...dependent,
        employeeId: employee.id
      };
      
      const createdDependent = await Dependent.create(dependentData, { transaction: t });
      createdDependents.push(createdDependent);
    }
    
    await t.commit();
    
    res.status(201).json({
      message: `${createdDependents.length} dependents migrated successfully`,
      data: createdDependents
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in migrateDependents:', err);
    
    res.status(500).json({
      message: "Error migrating dependents",
      error: err.message
    });
  }
};

// Bulk migrate trainings
exports.migrateTrainings = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { employeeId, trainings } = req.body;
    
    // Validate data
    if (!employeeId || !trainings || !Array.isArray(trainings)) {
      return res.status(400).json({
        message: "Invalid data format. employeeId and trainings array required."
      });
    }
    
    // Find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    // Process and create each training
    const createdTrainings = [];
    
    for (const training of trainings) {
      // Handle certificate if it's a base64 string
      if (training.certificateUrl && training.certificateUrl.startsWith('data:')) {
        try {
          const matches = training.certificateUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const type = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            
            const ext = type.split('/')[1];
            const filename = `training_${Date.now()}_${createdTrainings.length}.${ext}`;
            const uploadDir = path.join(__dirname, '../../uploads/trainings');
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            
            training.certificateUrl = `/uploads/trainings/${filename}`;
          }
        } catch (fileError) {
          console.error('Error processing training certificate:', fileError);
          delete training.certificateUrl;
        }
      }
      
      const trainingData = {
        ...training,
        employeeId: employee.id
      };
      
      const createdTraining = await Training.create(trainingData, { transaction: t });
      createdTrainings.push(createdTraining);
    }
    
    await t.commit();
    
    res.status(201).json({
      message: `${createdTrainings.length} trainings migrated successfully`,
      data: createdTrainings
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in migrateTrainings:', err);
    
    res.status(500).json({
      message: "Error migrating trainings",
      error: err.message
    });
  }
};

// Bulk migrate medical records
exports.migrateMedicalRecords = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { employeeId, medicalRecords } = req.body;
    
    // Validate data
    if (!employeeId || !medicalRecords || !Array.isArray(medicalRecords)) {
      return res.status(400).json({
        message: "Invalid data format. employeeId and medicalRecords array required."
      });
    }
    
    // Find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    // Process and create each medical record
    const createdMedicalRecords = [];
    
    for (const record of medicalRecords) {
      // Handle document if it's a base64 string
      if (record.documentUrl && record.documentUrl.startsWith('data:')) {
        try {
          const matches = record.documentUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const type = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            
            const ext = type.split('/')[1];
            const filename = `medical_${Date.now()}_${createdMedicalRecords.length}.${ext}`;
            const uploadDir = path.join(__dirname, '../../uploads/medical-records');
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            
            record.documentUrl = `/uploads/medical-records/${filename}`;
          }
        } catch (fileError) {
          console.error('Error processing medical record document:', fileError);
          delete record.documentUrl;
        }
      }
      
      const recordData = {
        ...record,
        employeeId: employee.id
      };
      
      const createdRecord = await MedicalRecord.create(recordData, { transaction: t });
      createdMedicalRecords.push(createdRecord);
    }
    
    await t.commit();
    
    res.status(201).json({
      message: `${createdMedicalRecords.length} medical records migrated successfully`,
      data: createdMedicalRecords
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in migrateMedicalRecords:', err);
    
    res.status(500).json({
      message: "Error migrating medical records",
      error: err.message
    });
  }
};

// Get migration status
exports.getMigrationStatus = async (req, res) => {
  try {
    const counts = {
      employees: await Employee.count(),
      qualifications: await Qualification.count(),
      dependents: await Dependent.count(), 
      trainings: await Training.count(),
      medicalRecords: await MedicalRecord.count()
    };
    
    res.status(200).json({
      status: 'success',
      data: counts
    });
  } catch (err) {
    console.error('Error getting migration status:', err);
    
    res.status(500).json({
      message: "Error getting migration status",
      error: err.message
    });
  }
}; 