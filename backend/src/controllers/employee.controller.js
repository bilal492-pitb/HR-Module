const db = require('../db/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    // Get all employees with basic information
    const employees = await db.all(`
      SELECT e.*, u.username, u.email, u.isActive 
      FROM employees e
      LEFT JOIN users u ON e.userId = u.id
      ORDER BY e.lastName ASC
    `);
    
    res.status(200).json({
      message: 'Employees retrieved successfully',
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving employees',
      error: error.message
    });
  }
};

// Get employee statistics for dashboard
exports.getEmployeeStatistics = async (req, res) => {
  try {
    // Get total number of employees
    const totalEmployeesResult = await db.get('SELECT COUNT(*) as count FROM employees');
    const totalEmployees = totalEmployeesResult ? totalEmployeesResult.count : 0;
    
    // Get employees grouped by department
    const employeesByDepartment = await db.all(`
      SELECT department, COUNT(*) as count 
      FROM employees 
      GROUP BY department
      ORDER BY count DESC
    `);
    
    // Get employees grouped by employment status
    const employeesByStatus = await db.all(`
      SELECT employmentStatus, COUNT(*) as count 
      FROM employees 
      GROUP BY employmentStatus
      ORDER BY count DESC
    `);
    
    // Get recent joiners (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const recentJoinersResult = await db.get(`
      SELECT COUNT(*) as count 
      FROM employees 
      WHERE joinDate >= ?
    `, [thirtyDaysAgoStr]);
    const recentJoiners = recentJoinersResult ? recentJoinersResult.count : 0;
    
    // Return all statistics
    res.status(200).json({
      message: 'Employee statistics retrieved successfully',
      data: {
        totalEmployees,
        employeesByDepartment,
        employeesByStatus,
        recentJoiners
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving employee statistics',
      error: error.message
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get employee with basic information
    const employee = await db.get(`
      SELECT e.*, u.username, u.email, u.isActive
      FROM employees e
      LEFT JOIN users u ON e.userId = u.id
      WHERE e.id = ?
    `, [id]);
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }
    
    // Get additional employee data
    const [qualifications, dependents, trainings, medicalRecords, salaryHistory, bankDetails] = await Promise.all([
      db.all('SELECT * FROM qualifications WHERE employeeId = ?', [id]),
      db.all('SELECT * FROM dependents WHERE employeeId = ?', [id]),
      db.all('SELECT * FROM trainings WHERE employeeId = ?', [id]),
      db.all('SELECT * FROM medical_records WHERE employeeId = ?', [id]),
      db.all('SELECT * FROM salary_history WHERE employeeId = ? ORDER BY effectiveDate DESC', [id]),
      db.get('SELECT * FROM bank_details WHERE employeeId = ?', [id])
    ]);
    
    // Add related data to the employee object
    const fullEmployeeData = {
      ...employee,
      qualifications: qualifications || [],
      dependents: dependents || [],
      trainings: trainings || [],
      medicalRecords: medicalRecords || [],
      salaryHistory: salaryHistory || [],
      bankDetails: bankDetails || null
    };
    
    res.status(200).json({
      message: 'Employee retrieved successfully',
      data: fullEmployeeData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving employee',
      error: error.message
    });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  const {
    firstName, lastName, email, position, department,
    employeeId, joinDate, emergencyContact, address, phone,
    dateOfBirth, gender, maritalStatus, profilePicture
  } = req.body;
  
  try {
    // Generate a username based on firstName and lastName
    const baseUsername = `${firstName.toLowerCase().substring(0, 1)}${lastName.toLowerCase()}`;
    
    // Check if username exists and make it unique if needed
    let username = baseUsername;
    let counter = 1;
    
    while (true) {
      const existingUser = await db.get(
        'SELECT * FROM users WHERE username = ?', 
        [username]
      );
      
      if (!existingUser) break;
      
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const now = new Date().toISOString();
    
    // Start transaction
    await db.transaction(async (dbRun) => {
      // Create user account first
      const userResult = await dbRun(
        `INSERT INTO users (username, email, password, role, isActive, lastLogin, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, 'employee', 1, now, now, now]
      );
      
      const userId = userResult.lastID;
      
      // Create employee record
      const employeeResult = await dbRun(
        `INSERT INTO employees (
          userId, firstName, lastName, employeeId, position, department,
          joinDate, emergencyContact, address, phone, dateOfBirth,
          gender, maritalStatus, profilePicture, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, firstName, lastName, employeeId || uuidv4().substring(0, 8).toUpperCase(),
          position, department, joinDate, JSON.stringify(emergencyContact || {}),
          address, phone, dateOfBirth, gender, maritalStatus,
          profilePicture, now, now
        ]
      );
      
      return {
        userId,
        employeeId: employeeResult.lastID
      };
    });
    
    // Get the created employee
    const newEmployee = await db.get(`
      SELECT e.*, u.username, u.email
      FROM employees e
      JOIN users u ON e.userId = u.id
      WHERE u.username = ?
    `, [username]);
    
    res.status(201).json({
      message: 'Employee created successfully',
      data: {
        ...newEmployee,
        tempPassword: randomPassword
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, position, department, joinDate,
      emergencyContact, address, phone, dateOfBirth,
      gender, maritalStatus, profilePicture
    } = req.body;
    
    // Check if employee exists
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }
    
    const now = new Date().toISOString();
    
    // Update employee record
    await db.run(
      `UPDATE employees SET
        firstName = ?,
        lastName = ?,
        position = ?,
        department = ?,
        joinDate = ?,
        emergencyContact = ?,
        address = ?,
        phone = ?,
        dateOfBirth = ?,
        gender = ?,
        maritalStatus = ?,
        profilePicture = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        firstName || employee.firstName,
        lastName || employee.lastName,
        position || employee.position,
        department || employee.department,
        joinDate || employee.joinDate,
        JSON.stringify(emergencyContact || JSON.parse(employee.emergencyContact || '{}')),
        address || employee.address,
        phone || employee.phone,
        dateOfBirth || employee.dateOfBirth,
        gender || employee.gender,
        maritalStatus || employee.maritalStatus,
        profilePicture || employee.profilePicture,
        now,
        id
      ]
    );
    
    // Get updated employee
    const updatedEmployee = await db.get(`
      SELECT e.*, u.username, u.email, u.isActive
      FROM employees e
      LEFT JOIN users u ON e.userId = u.id
      WHERE e.id = ?
    `, [id]);
    
    res.status(200).json({
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }
    
    const userId = employee.userId;
    
    // Use transaction to delete all related records
    await db.transaction(async (dbRun) => {
      // Delete related records
      await dbRun('DELETE FROM qualifications WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM dependents WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM trainings WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM medical_records WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM salary_history WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM bank_details WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM leaves WHERE employeeId = ?', [id]);
      await dbRun('DELETE FROM assets WHERE employeeId = ?', [id]);
      
      // Delete employee
      await dbRun('DELETE FROM employees WHERE id = ?', [id]);
      
      // Deactivate user instead of deleting to maintain audit trail
      await dbRun('UPDATE users SET isActive = 0 WHERE id = ?', [userId]);
    });
    
    res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting employee',
      error: error.message
    });
  }
}; 