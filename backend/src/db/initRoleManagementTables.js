const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create Roles table
const createRoles = `CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);`;

// Create Permissions table
const createPermissions = `CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);`;

// Create Posts table
const createPosts = `CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  numberOfPositions INTEGER,
  grade TEXT,
  department TEXT,
  position TEXT,
  filled INTEGER DEFAULT 0,
  vacant INTEGER DEFAULT 0
);`;

// Create Role Logs table
const createRoleLogs = `CREATE TABLE IF NOT EXISTS role_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  currentPost TEXT,
  previousRole TEXT,
  roleDateFrom TEXT,
  roleDateTo TEXT,
  roleChangeDate TEXT,
  roleChangedBy TEXT
);`;

// Create Role-Permission join table
const createRolePermission = `CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER,
  permission_id INTEGER,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);`;

const statements = [createRoles, createPermissions, createPosts, createRoleLogs, createRolePermission];

db.serialize(() => {
  statements.forEach(sql => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  });
});

db.close();
console.log('Role management tables ensured.');
