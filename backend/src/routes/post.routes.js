const express = require('express');
const router = express.Router();
const Post = require('../db/sqlite/post');

// Get all posts
router.get('/', (req, res) => {
  Post.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get post by id
router.get('/:id', (req, res) => {
  Post.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create post
router.post('/', (req, res) => {
  const { name, numberOfPositions, grade, department, position, filled, vacant } = req.body;
  Post.create({ name, numberOfPositions, grade, department, position, filled, vacant }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, numberOfPositions, grade, department, position, filled, vacant });
  });
});

// Update post
router.put('/:id', (req, res) => {
  const { name, numberOfPositions, grade, department, position, filled, vacant } = req.body;
  Post.update(req.params.id, { name, numberOfPositions, grade, department, position, filled, vacant }, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, name, numberOfPositions, grade, department, position, filled, vacant });
  });
});

// Delete post
router.delete('/:id', (req, res) => {
  Post.delete(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
