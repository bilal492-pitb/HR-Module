const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const db = require('../db/db');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if username or email already exists
    const existingUser = await db.get(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    
    // Create new user
    const result = await db.run(
      `INSERT INTO users (username, email, password, role, isActive, lastLogin, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role || 'employee', 1, now, now, now]
    );
    
    // Get the created user
    const newUser = await db.get(
      `SELECT id, username, email, role FROM users WHERE id = ?`,
      [result.lastID]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const user = await db.get(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, username] // Check both username and email fields
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    const now = new Date().toISOString();
    await db.run(
      `UPDATE users SET lastLogin = ?, updatedAt = ? WHERE id = ?`,
      [now, now, user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await db.get(
      `SELECT id, username, email, role, isActive, lastLogin, createdAt, updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User profile retrieved successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving user profile', 
      error: error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await db.get(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();
    
    // Update password
    await db.run(
      `UPDATE users SET password = ?, updatedAt = ? WHERE id = ?`,
      [hashedPassword, now, userId]
    );
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
}; 