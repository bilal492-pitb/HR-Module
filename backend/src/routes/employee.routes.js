const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticateToken, isHR, isManager } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all employees (accessible by manager and HR)
router.get('/', isManager, employeeController.getAllEmployees);

// Get employee statistics (accessible by HR only)
router.get('/statistics', isHR, employeeController.getEmployeeStatistics);

// Get employee by ID (accessible by manager and HR)
router.get('/:id', isManager, employeeController.getEmployeeById);

// Create new employee (accessible by HR only)
router.post('/', isHR, employeeController.createEmployee);

// Update employee (accessible by HR only)
router.put('/:id', isHR, employeeController.updateEmployee);

// Delete employee (accessible by HR only)
router.delete('/:id', isHR, employeeController.deleteEmployee);

module.exports = router; 