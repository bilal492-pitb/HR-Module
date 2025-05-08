const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');
const initDb = require('./db/init-db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const qualificationRoutes = require('./routes/qualification.routes');
const dependentRoutes = require('./routes/dependent.routes');
const trainingRoutes = require('./routes/training.routes');
const medicalRoutes = require('./routes/medical.routes');
const salaryRoutes = require('./routes/salary.routes');
const bankRoutes = require('./routes/bank.routes');
const leaveRoutes = require('./routes/leave.routes');
const assetRoutes = require('./routes/asset.routes');
const migrationRoutes = require('./routes/migration.routes');
const employeeAttachmentRoutes = require('./routes/employeeAttachment.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');
const postRoutes = require('./routes/post.routes');
const roleLogRoutes = require('./routes/role_log.routes');
const resetAdminPassword = require('./routes/resetAdminPassword');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for data migration
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', employeeAttachmentRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/dependents', dependentRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/bank-details', bankRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/role-logs', roleLogRoutes);
app.use('/api/reset-admin-password', resetAdminPassword);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Function to ensure default admin user exists
async function ensureAdminUser() {
  try {
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('Admin user not found, creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10); // Use same password as init-db
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
}

// Sync database and start server
async function startServer() {
  try {
    // Ensure database directory exists before syncing
    const fs = require('fs');
    const path = require('path');
    const dbDir = path.dirname(sequelize.getQueryInterface().sequelize.options.storage);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Force sync to ensure tables match models (use with caution in production)
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    // Call createTables function if it exists, otherwise log a message
    if (typeof initDb === 'object' && typeof initDb.createTables === 'function') {
      initDb.createTables();
    } else {
      console.log('Tables already created through sequelize sync');
    }
    
    await ensureAdminUser(); // Ensure admin user exists after sync
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
