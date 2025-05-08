const fs = require('fs');
const path = require('path');

function createEmployeeAttachmentsTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS employee_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    mimetype TEXT,
    size INTEGER,
    uploadedAt TEXT NOT NULL,
    FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE
  )`);
}

module.exports = { createEmployeeAttachmentsTable };
