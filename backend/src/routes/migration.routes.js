const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migration.controller');
const { authenticateToken, isHR } = require('../middleware/auth.middleware');

// Apply authentication middleware
router.use(authenticateToken);

// Get migration status
router.get('/status', migrationController.getMigrationStatus);

// Migrate an employee from localStorage to database (HR only)
router.post('/employees/migrate', isHR, migrationController.migrateEmployee);

// Bulk migrate qualifications (HR only)
router.post('/qualifications/bulk-migrate', isHR, migrationController.migrateQualifications);

// Bulk migrate dependents (HR only)
router.post('/dependents/bulk-migrate', isHR, migrationController.migrateDependents);

// Bulk migrate trainings (HR only)
router.post('/trainings/bulk-migrate', isHR, migrationController.migrateTrainings);

// Bulk migrate medical records (HR only)
router.post('/medical-records/bulk-migrate', isHR, migrationController.migrateMedicalRecords);

module.exports = router; 