const db = require('../models');
const MedicalRecord = db.MedicalRecord;
const Employee = db.Employee;
const { handleFileUpload, handleFileDelete } = require('../utils/fileHelper');

// Create and Save a new Medical Record
exports.create = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate request
    if (!req.body.recordType || !req.body.recordDate) {
      return res.status(400).send({
        message: "Record type and date cannot be empty!"
      });
    }
    
    // Find employee first to verify they exist
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).send({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    // Process document upload if present
    let documentUrl = null;
    if (req.files && req.files.document) {
      const uploadResult = await handleFileUpload(req.files.document, 'medical-records');
      documentUrl = uploadResult.url;
    }
    
    // Create medical record data
    const medicalRecordData = {
      employeeId,
      recordType: req.body.recordType,
      recordDate: req.body.recordDate,
      providerName: req.body.providerName,
      description: req.body.description,
      followUpRequired: req.body.followUpRequired === 'true' || req.body.followUpRequired === true,
      followUpDate: req.body.followUpDate,
      documentUrl,
      confidential: req.body.confidential === 'true' || req.body.confidential === true,
      notes: req.body.notes
    };
    
    // Save Medical Record in the database
    const medicalRecord = await MedicalRecord.create(medicalRecordData);
    
    res.status(201).send(medicalRecord);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Medical Record."
    });
  }
};

// Retrieve all Medical Records for a specific employee
exports.findAll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).send({
        message: `Employee with id=${employeeId} not found.`
      });
    }
    
    const medicalRecords = await MedicalRecord.findAll({
      where: { employeeId },
      order: [['recordDate', 'DESC']]
    });
    
    res.send(medicalRecords);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving medical records."
    });
  }
};

// Find a single Medical Record with an id
exports.findOne = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    const medicalRecord = await MedicalRecord.findOne({
      where: { 
        id,
        employeeId
      }
    });
    
    if (!medicalRecord) {
      return res.status(404).send({
        message: `Medical Record with id=${id} not found for this employee.`
      });
    }
    
    res.send(medicalRecord);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Medical Record with id=${req.params.id}`
    });
  }
};

// Update a Medical Record
exports.update = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    // Find record first
    const medicalRecord = await MedicalRecord.findOne({
      where: { 
        id,
        employeeId
      }
    });
    
    if (!medicalRecord) {
      return res.status(404).send({
        message: `Medical Record with id=${id} not found for this employee.`
      });
    }
    
    // Process document upload if present
    let documentUrl = medicalRecord.documentUrl;
    if (req.files && req.files.document) {
      // Delete old file if exists
      if (documentUrl) {
        await handleFileDelete(documentUrl);
      }
      
      const uploadResult = await handleFileUpload(req.files.document, 'medical-records');
      documentUrl = uploadResult.url;
    }
    
    // Update with new data
    const updatedData = {
      recordType: req.body.recordType,
      recordDate: req.body.recordDate,
      providerName: req.body.providerName,
      description: req.body.description,
      followUpRequired: req.body.followUpRequired === 'true' || req.body.followUpRequired === true,
      followUpDate: req.body.followUpDate,
      documentUrl,
      confidential: req.body.confidential === 'true' || req.body.confidential === true,
      notes: req.body.notes
    };
    
    const [num] = await MedicalRecord.update(updatedData, {
      where: { id, employeeId }
    });
    
    if (num === 1) {
      res.send({
        message: "Medical Record was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Medical Record with id=${id}. Maybe Medical Record was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating Medical Record with id=${req.params.id}`
    });
  }
};

// Delete a Medical Record
exports.delete = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    // Find record first to get document URL if exists
    const medicalRecord = await MedicalRecord.findOne({
      where: { 
        id,
        employeeId
      }
    });
    
    if (!medicalRecord) {
      return res.status(404).send({
        message: `Medical Record with id=${id} not found for this employee.`
      });
    }
    
    // Delete associated document if exists
    if (medicalRecord.documentUrl) {
      await handleFileDelete(medicalRecord.documentUrl);
    }
    
    // Delete record
    const num = await MedicalRecord.destroy({
      where: { id, employeeId }
    });
    
    if (num === 1) {
      res.send({
        message: "Medical Record was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Medical Record with id=${id}. Maybe Medical Record was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Medical Record with id=${req.params.id}`
    });
  }
}; 