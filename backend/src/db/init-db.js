const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { createEmployeeAttachmentsTable } = require('./employeeAttachment');

// Path to the database file
const dbPath = path.join(__dirname, '../../database.sqlite');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
function createTables() {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'hr', 'manager', 'employee')),
    isActive INTEGER NOT NULL DEFAULT 1,
    lastLogin TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
      
      // Check if admin user exists
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Error checking for admin user:', err.message);
        } else if (!row) {
          // Create default admin user if doesn't exist
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          const now = new Date().toISOString();
          
          db.run(`INSERT INTO users (username, email, password, role, isActive, createdAt, updatedAt) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            ['admin', 'admin@example.com', hashedPassword, 'admin', 1, now, now], 
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log('Admin user created with ID:', this.lastID);
              }
            });
        }
      });
    }
  });

  // Create employees table
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL UNIQUE,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    middleName TEXT,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
    dateOfBirth TEXT,
    maritalStatus TEXT CHECK(maritalStatus IN ('Single', 'Married', 'Divorced', 'Widowed')),
    nationality TEXT,
    email TEXT,
    phoneNumber TEXT,
    alternatePhoneNumber TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postalCode TEXT,
    country TEXT,
    jobTitle TEXT,
    department TEXT,
    supervisor TEXT,
    employmentStatus TEXT CHECK(employmentStatus IN ('Full-Time', 'Part-Time', 'Contract', 'Intern', 'Terminated')),
    joinDate TEXT,
    terminationDate TEXT,
    emergencyContactName TEXT,
    emergencyContactRelation TEXT,
    emergencyContactPhone TEXT,
    profilePicture TEXT,
    notes TEXT,
    userId INTEGER,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating employees table:', err.message);
    } else {
      console.log('Employees table created or already exists.');
    }
  });

  // Create qualifications table
  db.run(`CREATE TABLE IF NOT EXISTS qualifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    qualificationType TEXT NOT NULL,
    qualificationName TEXT NOT NULL,
    institution TEXT NOT NULL,
    startDate TEXT,
    endDate TEXT,
    grade TEXT,
    description TEXT,
    documentUrl TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating qualifications table:', err.message);
    } else {
      console.log('Qualifications table created or already exists.');
    }
  });

  // Create dependents table
  db.run(`CREATE TABLE IF NOT EXISTS dependents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    relationship TEXT NOT NULL,
    dateOfBirth TEXT,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
    contactNumber TEXT,
    isEmergencyContact INTEGER DEFAULT 0,
    address TEXT,
    isBeneficiary INTEGER DEFAULT 0,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating dependents table:', err.message);
    } else {
      console.log('Dependents table created or already exists.');
    }
  });

  // Create trainings table
  db.run(`CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    trainingName TEXT NOT NULL,
    provider TEXT,
    trainingType TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT,
    duration TEXT,
    location TEXT,
    description TEXT,
    status TEXT CHECK(status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    cost REAL,
    certificate INTEGER DEFAULT 0,
    certificateUrl TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating trainings table:', err.message);
    } else {
      console.log('Trainings table created or already exists.');
    }
  });

  // Create medical_records table
  db.run(`CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    recordType TEXT NOT NULL,
    recordDate TEXT NOT NULL,
    expiryDate TEXT,
    description TEXT,
    provider TEXT,
    location TEXT,
    results TEXT,
    documentUrl TEXT,
    followUpRequired INTEGER DEFAULT 0,
    followUpDate TEXT,
    notes TEXT,
    confidential INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating medical_records table:', err.message);
    } else {
      console.log('Medical Records table created or already exists.');
    }
  });

  // Create salary_history table
  db.run(`CREATE TABLE IF NOT EXISTS salary_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    effectiveDate TEXT NOT NULL,
    salaryAmount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    salaryType TEXT CHECK(salaryType IN ('Monthly', 'Annual', 'Hourly', 'Contract')),
    reason TEXT NOT NULL,
    percentageIncrease REAL,
    approvedBy TEXT,
    approvalDate TEXT,
    bonusAmount REAL,
    allowances REAL,
    deductions REAL,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating salary_history table:', err.message);
    } else {
      console.log('Salary History table created or already exists.');
    }
  });

  // Create bank_details table
  db.run(`CREATE TABLE IF NOT EXISTS bank_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    bankName TEXT NOT NULL,
    accountHolderName TEXT NOT NULL,
    accountNumber TEXT NOT NULL,
    accountType TEXT,
    branchName TEXT,
    branchCode TEXT,
    routingNumber TEXT,
    swiftCode TEXT,
    ifscCode TEXT,
    taxId TEXT,
    isActive INTEGER DEFAULT 1,
    lastUpdated TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating bank_details table:', err.message);
    } else {
      console.log('Bank Details table created or already exists.');
    }
  });

  // Create leaves table
  db.run(`CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    leaveType TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    totalDays REAL NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    appliedDate TEXT,
    approvedBy TEXT,
    approvedDate TEXT,
    rejectionReason TEXT,
    attachmentUrl TEXT,
    halfDayOption TEXT DEFAULT 'None',
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating leaves table:', err.message);
    } else {
      console.log('Leaves table created or already exists.');
    }
  });

  // Create assets table
  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER,
    assetType TEXT NOT NULL,
    assetName TEXT NOT NULL,
    assetTag TEXT,
    serialNumber TEXT,
    manufacturer TEXT,
    model TEXT,
    purchaseDate TEXT,
    purchasePrice REAL,
    currency TEXT DEFAULT 'USD',
    warrantyExpiry TEXT,
    condition TEXT,
    assignDate TEXT,
    returnDate TEXT,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Available',
    documentUrl TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE SET NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating assets table:', err.message);
    } else {
      console.log('Assets table created or already exists.');
    }
  });

  createEmployeeAttachmentsTable(db);

  console.log('All tables created successfully');
  db.close();
}

// Run the database initialization
createTables(); 