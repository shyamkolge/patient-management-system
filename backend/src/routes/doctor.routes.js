import express from 'express';
import {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    getDoctorAppointments,
} from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Public route to view doctors
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.use(authenticate);

router.get('/:id/appointments', getDoctorAppointments);

// Only Admin can create and update doctors
router.post('/', isAdmin, createDoctor);
router.put('/:id', isAdmin, updateDoctor);

export default router;
