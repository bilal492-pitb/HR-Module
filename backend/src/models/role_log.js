const sqlite3 = require('sqlite3').verbose();
const db = require('../db/db');

const RoleLog = {
  getAll: (cb) => {
    db.all('SELECT * FROM role_logs', [], cb);
  },
  getById: (id, cb) => {
    db.get('SELECT * FROM role_logs WHERE id = ?', [id], cb);
  },
  create: (log, cb) => {
    db.run('INSERT INTO role_logs (name, currentPost, previousRole, roleDateFrom, roleDateTo, roleChangeDate, roleChangedBy) VALUES (?, ?, ?, ?, ?, ?, ?)', [log.name, log.currentPost, log.previousRole, log.roleDateFrom, log.roleDateTo, log.roleChangeDate, log.roleChangedBy], cb);
  },
  delete: (id, cb) => {
    db.run('DELETE FROM role_logs WHERE id = ?', [id], cb);
  }
};

module.exports = RoleLog;
