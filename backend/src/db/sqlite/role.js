const sqlite3 = require('sqlite3').verbose();
const db = require('../db');

const Role = {
  getAll: (cb) => {
    db.all('SELECT * FROM roles', [], cb);
  },
  getById: (id, cb) => {
    db.get('SELECT * FROM roles WHERE id = ?', [id], cb);
  },
  create: (role, cb) => {
    db.run('INSERT INTO roles (name, description) VALUES (?, ?)', [role.name, role.description], cb);
  },
  update: (id, role, cb) => {
    db.run('UPDATE roles SET name = ?, description = ? WHERE id = ?', [role.name, role.description, id], cb);
  },
  delete: (id, cb) => {
    db.run('DELETE FROM roles WHERE id = ?', [id], cb);
  }
};

module.exports = Role;
