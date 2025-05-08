const express = require('express');
const router = express.Router();
const Role = require('../db/sqlite/role');

// Get all roles
router.get('/', (req, res) => {
  Role.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get role by id
router.get('/:id', (req, res) => {
  Role.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create role
router.post('/', (req, res) => {
  const { name, description } = req.body;
  Role.create({ name, description }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, description });
  });
});

// Update role
router.put('/:id', (req, res) => {
  const { name, description } = req.body;
  Role.update(req.params.id, { name, description }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, name, description });
  });
});

// Delete role
router.delete('/:id', (req, res) => {
  Role.delete(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
