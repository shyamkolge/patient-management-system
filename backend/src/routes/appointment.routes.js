import express from 'express';
import {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, appointmentSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', validate(appointmentSchema), createAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;
