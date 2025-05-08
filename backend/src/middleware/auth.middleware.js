const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'hr-management-secret-key';

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the user exists
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // If the user is not active
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }
    
    // Set the user in the request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    // Update last login time
    await user.update({ lastLogin: new Date() });
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Middleware to check if user has HR role
const isHR = (req, res, next) => {
  if (req.user && (req.user.role === 'hr' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. HR role required.' });
  }
};

// Middleware to check if user has manager role
const isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin' || req.user.role === 'hr')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Manager role required.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isHR,
  isManager,
  JWT_SECRET
}; 