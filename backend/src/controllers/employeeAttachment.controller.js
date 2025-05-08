const path = require('path');
const fs = require('fs');
const db = require('../db/db');

// Upload multiple attachments
exports.uploadAttachments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const now = new Date().toISOString();
    const insertQueries = req.files.map(file => {
      return {
        query: `INSERT INTO employee_attachments (employeeId, filename, filepath, mimetype, size, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)` ,
        params: [employeeId, file.originalname, file.path, file.mimetype, file.size, now]
      };
    });
    await db.transaction(insertQueries);
    res.status(201).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
};

// List all attachments for an employee
exports.listAttachments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const attachments = await db.all('SELECT * FROM employee_attachments WHERE employeeId = ?', [employeeId]);
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachments', error: error.message });
  }
};

// Download/view an attachment
exports.getAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await db.get('SELECT * FROM employee_attachments WHERE id = ?', [attachmentId]);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    res.download(attachment.filepath, attachment.filename);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading attachment', error: error.message });
  }
};

// Delete an attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await db.get('SELECT * FROM employee_attachments WHERE id = ?', [attachmentId]);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    // Delete file from disk
    if (fs.existsSync(attachment.filepath)) {
      fs.unlinkSync(attachment.filepath);
    }
    await db.run('DELETE FROM employee_attachments WHERE id = ?', [attachmentId]);
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
};
