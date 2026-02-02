import express from 'express';
import {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientHistory,
} from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isAdminOrDoctor } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin and Doctor can view patients
router.get('/', isAdminOrDoctor, getAllPatients);
router.get('/:id', isAdminOrDoctor, getPatientById);
router.get('/:id/history', isAdminOrDoctor, getPatientHistory);

// Only Admin can create, update, delete patients
router.post('/', isAdmin, createPatient);
router.put('/:id', isAdmin, updatePatient);
router.delete('/:id', isAdmin, deletePatient);

export default router;
