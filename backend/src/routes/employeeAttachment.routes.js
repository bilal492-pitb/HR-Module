const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const employeeAttachmentController = require('../controllers/employeeAttachment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/employee_attachments');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// All routes require authentication
router.use(authenticateToken);

// Upload multiple attachments
router.post('/:employeeId/attachments', upload.array('attachments', 10), employeeAttachmentController.uploadAttachments);

// List attachments
router.get('/:employeeId/attachments', employeeAttachmentController.listAttachments);

// Download/view attachment
router.get('/:employeeId/attachments/:attachmentId', employeeAttachmentController.getAttachment);

// Delete attachment
router.delete('/:employeeId/attachments/:attachmentId', employeeAttachmentController.deleteAttachment);

module.exports = router;
