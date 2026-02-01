import express from 'express';
import {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getDoctorStats,
    getDoctorWeeklyStats,
    getDoctorMonthlyTrends,
    getAppointmentStatusDistribution,
    getDoctorRequests,
    getDoctorUpcomingAppointments,
    getDoctorPastAppointments,
    getDoctorTodaySchedule,
    getAppointmentSchedule,
    startConsultation,
    completeConsultation,
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, appointmentSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Doctor dashboard analytics routes - must be before /:id
router.get('/doctor/stats', getDoctorStats);
router.get('/doctor/weekly-stats', getDoctorWeeklyStats);
router.get('/doctor/monthly-trends', getDoctorMonthlyTrends);
router.get('/doctor/status-distribution', getAppointmentStatusDistribution);
router.get('/doctor/requests', getDoctorRequests);
router.get('/doctor/upcoming', getDoctorUpcomingAppointments);
router.get('/doctor/past', getDoctorPastAppointments);
router.get('/doctor/today', getDoctorTodaySchedule);
router.get('/doctor/schedule', getAppointmentSchedule);

// Standard routes
router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', validate(appointmentSchema), createAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.post('/:id/start', startConsultation);
router.post('/:id/complete', completeConsultation);
router.delete('/:id', deleteAppointment);

export default router;
