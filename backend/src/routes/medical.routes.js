const express = require('express');
const router = express.Router();
const { authenticateToken, isHR } = require('../middleware/auth.middleware');
const multer = require('multer');
const medicalController = require('../controllers/medical.controller');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(authenticateToken);

// Get all medical records for an employee
router.get('/employee/:employeeId', medicalController.getAllMedicalRecords);

// Get a specific medical record
router.get('/record/:id', medicalController.getMedicalRecordById);

// Create new medical record
router.post('/:employeeId', isHR, upload.single('document'), medicalController.createMedicalRecord);

// Update medical record
router.put('/record/:id', isHR, upload.single('document'), medicalController.updateMedicalRecord);

// Delete medical record
router.delete('/record/:id', isHR, medicalController.deleteMedicalRecord);

module.exports = router; 