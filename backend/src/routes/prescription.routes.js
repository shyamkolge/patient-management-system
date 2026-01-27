import express from 'express';
import {
    getAllPrescriptions,
    getPrescriptionById,
    getPatientPrescriptions,
    createPrescription,
    updatePrescription,
} from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isDoctor, isAdminOrDoctor } from '../middleware/rbac.js';
import { validate, prescriptionSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);
router.get('/patient/:patientId', isAdminOrDoctor, getPatientPrescriptions);

// Only doctors can create and update prescriptions
router.post('/', isDoctor, validate(prescriptionSchema), createPrescription);
router.put('/:id', isDoctor, updatePrescription);

export default router;
