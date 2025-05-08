const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const router = express.Router();

// TEMPORARY: Reset admin password to 'admin123'
router.post('/', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `UPDATE users SET password = ? WHERE username = 'admin' OR email = 'admin@example.com'`,
      [hashedPassword]
    );
    res.json({ message: 'Admin password reset to admin123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
