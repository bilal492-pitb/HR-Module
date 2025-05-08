const express = require('express');
const router = express.Router();
const RoleLog = require('../db/sqlite/role_log');

// Get all role logs
router.get('/', (req, res) => {
  RoleLog.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get role log by id
router.get('/:id', (req, res) => {
  RoleLog.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create role log
router.post('/', (req, res) => {
  const { name, currentPost, previousRole, roleDateFrom, roleDateTo, roleChangeDate, roleChangedBy } = req.body;
  RoleLog.create({ name, currentPost, previousRole, roleDateFrom, roleDateTo, roleChangeDate, roleChangedBy }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, currentPost, previousRole, roleDateFrom, roleDateTo, roleChangeDate, roleChangedBy });
  });
});

// Delete role log
router.delete('/:id', (req, res) => {
  RoleLog.delete(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
