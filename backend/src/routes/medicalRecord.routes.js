import express from 'express';
import multer from 'multer';
import {
    getAllMedicalRecords,
    getMedicalRecordById,
    getPatientMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    uploadAttachment,
    getPatientAttachments,
} from '../controllers/medicalRecord.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isDoctor, isAdminOrDoctor } from '../middleware/rbac.js';
import { validate, medicalRecordSchema } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authenticate);

router.get('/', getAllMedicalRecords);
router.get('/attachments', getPatientAttachments);
router.get('/:id', getMedicalRecordById);
router.get('/patient/:patientId', isAdminOrDoctor, getPatientMedicalRecords);

// Only doctors can create and update medical records
router.post('/', isDoctor, validate(medicalRecordSchema), createMedicalRecord);
router.put('/:id', isDoctor, updateMedicalRecord);
router.post('/:id/upload', isDoctor, upload.single('file'), uploadAttachment);

export default router;
