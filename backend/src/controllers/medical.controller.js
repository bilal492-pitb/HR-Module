const db = require('../db/db');
const path = require('path');
const fs = require('fs');

// Get all medical records for an employee
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }
    
    // Get medical records
    const medicalRecords = await db.all(
      'SELECT * FROM medical_records WHERE employeeId = ? ORDER BY recordDate DESC',
      [employeeId]
    );
    
    res.status(200).json({
      message: 'Medical records retrieved successfully',
      data: medicalRecords
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving medical records',
      error: error.message
    });
  }
};

// Get a specific medical record
exports.getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get medical record
    const medicalRecord = await db.get('SELECT * FROM medical_records WHERE id = ?', [id]);
    
    if (!medicalRecord) {
      return res.status(404).json({
        message: 'Medical record not found'
      });
    }
    
    res.status(200).json({
      message: 'Medical record retrieved successfully',
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving medical record',
      error: error.message
    });
  }
};

// Create a new medical record
exports.createMedicalRecord = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      recordType,
      recordDate,
      expiryDate,
      description,
      provider,
      location,
      results,
      followUpRequired,
      followUpDate,
      notes,
      isConfidential
    } = req.body;
    
    // Check if employee exists
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [employeeId]);
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }
    
    // Handle document file if uploaded
    let documentUrl = null;
    if (req.file) {
      // Create a unique filename
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(__dirname, '../../uploads/medical', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Set document URL for database
      documentUrl = `/uploads/medical/${fileName}`;
    }
    
    const now = new Date().toISOString();
    
    // Insert medical record
    const result = await db.run(
      `INSERT INTO medical_records (
        employeeId, recordType, recordDate, expiryDate, description,
        provider, location, results, documentUrl, followUpRequired,
        followUpDate, notes, isConfidential, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        recordType,
        recordDate,
        expiryDate || null,
        description || null,
        provider || null,
        location || null,
        results || null,
        documentUrl,
        followUpRequired ? 1 : 0,
        followUpDate || null,
        notes || null,
        isConfidential ? 1 : 0,
        now,
        now
      ]
    );
    
    // Get the created record
    const newRecord = await db.get('SELECT * FROM medical_records WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      message: 'Medical record created successfully',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating medical record',
      error: error.message
    });
  }
};

// Update a medical record
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recordType,
      recordDate,
      expiryDate,
      description,
      provider,
      location,
      results,
      followUpRequired,
      followUpDate,
      notes,
      isConfidential
    } = req.body;
    
    // Check if record exists
    const record = await db.get('SELECT * FROM medical_records WHERE id = ?', [id]);
    
    if (!record) {
      return res.status(404).json({
        message: 'Medical record not found'
      });
    }
    
    // Handle document file if uploaded
    let documentUrl = record.documentUrl;
    if (req.file) {
      // Delete old file if exists
      if (record.documentUrl) {
        const oldFilePath = path.join(__dirname, '../..', record.documentUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Create a unique filename
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(__dirname, '../../uploads/medical', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Set document URL for database
      documentUrl = `/uploads/medical/${fileName}`;
    }
    
    const now = new Date().toISOString();
    
    // Update record
    await db.run(
      `UPDATE medical_records SET
        recordType = ?,
        recordDate = ?,
        expiryDate = ?,
        description = ?,
        provider = ?,
        location = ?,
        results = ?,
        documentUrl = ?,
        followUpRequired = ?,
        followUpDate = ?,
        notes = ?,
        isConfidential = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        recordType || record.recordType,
        recordDate || record.recordDate,
        expiryDate || record.expiryDate,
        description || record.description,
        provider || record.provider,
        location || record.location,
        results || record.results,
        documentUrl,
        followUpRequired !== undefined ? (followUpRequired ? 1 : 0) : record.followUpRequired,
        followUpDate || record.followUpDate,
        notes || record.notes,
        isConfidential !== undefined ? (isConfidential ? 1 : 0) : record.isConfidential,
        now,
        id
      ]
    );
    
    // Get updated record
    const updatedRecord = await db.get('SELECT * FROM medical_records WHERE id = ?', [id]);
    
    res.status(200).json({
      message: 'Medical record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating medical record',
      error: error.message
    });
  }
};

// Delete a medical record
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const record = await db.get('SELECT * FROM medical_records WHERE id = ?', [id]);
    
    if (!record) {
      return res.status(404).json({
        message: 'Medical record not found'
      });
    }
    
    // Delete associated file if exists
    if (record.documentUrl) {
      const filePath = path.join(__dirname, '../..', record.documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete record
    await db.run('DELETE FROM medical_records WHERE id = ?', [id]);
    
    res.status(200).json({
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting medical record',
      error: error.message
    });
  }
}; 