const express = require('express');
const router = express.Router();
const Permission = require('../db/sqlite/permission');

// Get all permissions
router.get('/', (req, res) => {
  Permission.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get permission by id
router.get('/:id', (req, res) => {
  Permission.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create permission
router.post('/', (req, res) => {
  const { name, description } = req.body;
  Permission.create({ name, description }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, description });
  });
});

// Update permission
router.put('/:id', (req, res) => {
  const { name, description } = req.body;
  Permission.update(req.params.id, { name, description }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, name, description });
  });
});

// Delete permission
router.delete('/:id', (req, res) => {
  Permission.delete(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
