const sqlite3 = require('sqlite3').verbose();
const db = require('../db/db');

const Permission = {
  getAll: (cb) => {
    db.all('SELECT * FROM permissions', [], cb);
  },
  getById: (id, cb) => {
    db.get('SELECT * FROM permissions WHERE id = ?', [id], cb);
  },
  create: (permission, cb) => {
    db.run('INSERT INTO permissions (name, description) VALUES (?, ?)', [permission.name, permission.description], cb);
  },
  update: (id, permission, cb) => {
    db.run('UPDATE permissions SET name = ?, description = ? WHERE id = ?', [permission.name, permission.description, id], cb);
  },
  delete: (id, cb) => {
    db.run('DELETE FROM permissions WHERE id = ?', [id], cb);
  }
};

module.exports = Permission;
