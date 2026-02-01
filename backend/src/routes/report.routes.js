import express from 'express';
import { uploadReport, getReports, deleteReport } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('file'), uploadReport);
router.get('/', authenticate, getReports);
router.delete('/:id', authenticate, deleteReport);

export default router;
