import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { sendAppointmentConfirmedNotification } from '../utils/pingram.js';
import { io, getReceiverSocketId } from '../services/socket.js';
import crypto from 'crypto';

/**
 * Get all appointments (filtered by role)
 */
export const getAllAppointments = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

        const { role, id } = req.user;

        let query = {};

        // Filter by role
        if (role === 'doctor') {
            const doctor = await Doctor.findOne({ user: id });
            query.doctor = doctor._id;
        } else if (role === 'patient') {
            const patient = await Patient.findOne({ user: id });
            query.patient = patient._id;
        }

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        const count = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count,
            },
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
        });
    }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
        });
    }
};

/**
 * Create appointment
 */
export const createAppointment = async (req, res) => {
    try {
        const { paymentMode, paymentResult, ...appointmentData } = req.body;
        let finalAppointmentData = { ...appointmentData, paymentMode };

        if (paymentMode === 'online') {
            if (!paymentResult || !paymentResult.razorpay_order_id || !paymentResult.razorpay_payment_id || !paymentResult.razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Payment details are missing' });
            }

            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResult;
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Payment verification failed' });
            }

            finalAppointmentData.paymentStatus = 'paid';
            finalAppointmentData.transactionId = razorpay_payment_id;
        }

        const appointment = await Appointment.create(finalAppointmentData);

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        // Create Notification
        const notification = new Notification({
            recipient: populatedAppointment.doctor.user._id,
            sender: populatedAppointment.patient.user._id,
            type: 'appointment_created',
            message: `New appointment booked by ${populatedAppointment.patient.user.firstName} ${populatedAppointment.patient.user.lastName}`,
            relatedId: populatedAppointment._id,
            link: `/doctor/appointments/${populatedAppointment._id}`,
            read: false
        });
        await notification.save();

        // Emit Socket Event
        const receiverId = populatedAppointment.doctor.user._id.toString();
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newNotification', notification);
            io.to(receiverSocketId).emit('appointment_created', populatedAppointment);
        } else {
            // Doctor not connected, notification saved to DB only.
        }


        // Send payment receipt if paid
        if (finalAppointmentData.paymentStatus === 'paid' && populatedAppointment.patient?.user?.email) {

            // console.log('Sending payment receipt to:', populatedAppointment.patient.user.email);

            const patientUser = populatedAppointment.patient.user;
            const emailSubject = 'Payment Receipt - CarePlus Appointment';

            const emailHtml = `
                <h2>Payment Receipt</h2>
                <p>Dear ${patientUser.firstName},</p>
                <p>Thank you for your payment. Here are your appointment and payment details:</p>
                <ul>
                  <li><b>Appointment Date:</b> ${populatedAppointment.appointmentDate?.toLocaleDateString?.() || ''}</li>
                  <li><b>Time:</b> ${populatedAppointment.appointmentTime || ''}</li>
                  <li><b>Doctor:</b> Dr. ${populatedAppointment.doctor?.user?.firstName || ''} ${populatedAppointment.doctor?.user?.lastName || ''}</li>
                  <li><b>Transaction ID:</b> ${finalAppointmentData.transactionId || ''}</li>
                  <li><b>Amount:</b> Paid</li>
                </ul>
                <p>If you have any questions, please contact us.</p>
                <p>CarePlus Team</p>
            `;
            try {
                await sendAppointmentConfirmedNotification({
                    toEmail: patientUser.email,
                    toId: patientUser.email,
                    smsMessage: undefined, // No SMS
                    callMessage: undefined, // No call
                    emailSubject,
                    emailHtml
                });
            } catch (e) {
                console.error('Failed to send payment receipt:', e.message || e);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: populatedAppointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message,
        });
    }
};

/**
 * Update appointment
 */
export const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment,
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
        });
    }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body;

        // Require cancelReason if cancelling
        if (status === 'cancelled' && (!cancelReason || cancelReason.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required when cancelling an appointment.'
            });
        }

        const updateData = { status };
        if (status === 'cancelled') {
            updateData.cancelReason = cancelReason;
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Send notification if doctor accepts (confirms) the appointment
        const patientUser = appointment.patient?.user;
        if (status === 'confirmed') {

            if (patientUser?.phone) {
                const smsMsg = `Dear ${patientUser.firstName}, your appointment with Dr. ${appointment.doctor?.user?.lastName || ''} on ${appointment.appointmentDate?.toLocaleDateString()} at ${appointment.appointmentTime} has been confirmed.`;
                const callMsg = `This is a confirmation call from PRMS. Your appointment with Dr. ${appointment.doctor?.user?.lastName || ''} on ${appointment.appointmentDate?.toLocaleDateString()} at ${appointment.appointmentTime} has been confirmed.`;
                try {
                    await sendAppointmentConfirmedNotification({
                        toNumber: `+91${patientUser.phone}`,
                        toEmail: patientUser.email,
                        toId: patientUser.email,
                        smsMessage: smsMsg,
                        callMessage: callMsg
                    });
                } catch (e) {
                    console.error('Failed to send notification via NotificationAPI:', e.message || e);
                }
            }
        }
        // Send cancellation notification if doctor cancels
        if (status === 'cancelled' && patientUser?.phone) {
            const smsMsg = `Dear ${patientUser.firstName}, your appointment with Dr. ${appointment.doctor?.user?.lastName || ''} on ${appointment.appointmentDate?.toLocaleDateString()} at ${appointment.appointmentTime} has been cancelled. Reason: ${cancelReason}`;
            try {
                await sendAppointmentConfirmedNotification({
                    toNumber: `+91${patientUser.phone}`,
                    toEmail: patientUser.email,
                    toId: patientUser.email,
                    smsMessage: smsMsg,
                    callMessage: smsMsg
                });
            } catch (e) {
                console.error('Failed to send cancellation notification via NotificationAPI:', e.message || e);
            }
        }

        // Emit Socket Event to Patient
        if (patientUser?._id) {
            const receiverSocketId = getReceiverSocketId(patientUser._id.toString());
            console.log(`[DEBUG] Update Appointment Status: Patient ID: ${patientUser._id}, Socket ID: ${receiverSocketId}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('appointment_updated', appointment);
                console.log(`[DEBUG] Emitted appointment_updated to ${receiverSocketId}`);
            } else {
                console.log(`[DEBUG] Patient not connected`);
            }
        } else {
            console.log(`[DEBUG] No patient user found in appointment`);
        }

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            data: appointment,
        });

    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
        });
    }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully',
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
        });
    }
};

/**
 * Get doctor dashboard statistics
 */
export const getDoctorStats = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Today's appointments
        const todayAppointments = await Appointment.countDocuments({
            doctor: doctor._id,
            appointmentDate: { $gte: today, $lt: tomorrow },
        });

        // Upcoming appointments (next 7 days)
        const upcomingAppointments = await Appointment.countDocuments({
            doctor: doctor._id,
            appointmentDate: { $gte: today, $lt: nextWeek },
            status: { $in: ['confirmed', 'pending'] }
        });

        // Pending requests
        const pendingRequests = await Appointment.countDocuments({
            doctor: doctor._id,
            status: 'pending',
        });

        // Patients this month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const patientsThisMonth = await Appointment.distinct('patient', {
            doctor: doctor._id,
            appointmentDate: { $gte: monthStart, $lt: monthEnd },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            data: {
                todayAppointments,
                upcomingAppointments,
                pendingRequests,
                patientsThisMonth: patientsThisMonth.length,
                todayTrend: '+12%', // Mock data
            },
        });
    } catch (error) {
        console.error('Get doctor stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
        });
    }
};

/**
 * Get doctor's weekly consultation stats
 */
export const getDoctorWeeklyStats = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);

            const nextDay = new Date(dayDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await Appointment.countDocuments({
                doctor: doctor._id,
                appointmentDate: { $gte: dayDate, $lt: nextDay },
                status: { $in: ['confirmed', 'completed'] }
            });

            data.push({
                label: days[i],
                value: count,
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly stats',
        });
    }
};

/**
 * Get doctor's monthly trends
 */
export const getDoctorMonthlyTrends = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        const data = [];

        // Get last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const completed = await Appointment.countDocuments({
                doctor: doctor._id,
                appointmentDate: { $gte: date, $lt: nextDay },
                status: 'completed'
            });

            const cancelled = await Appointment.countDocuments({
                doctor: doctor._id,
                appointmentDate: { $gte: date, $lt: nextDay },
                status: 'cancelled'
            });

            data.push({
                label: `${date.getDate()}/${date.getMonth() + 1}`,
                value: completed,
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get monthly trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly trends',
        });
    }
};

/**
 * Get appointment status distribution
 */
export const getAppointmentStatusDistribution = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const completed = await Appointment.countDocuments({
            doctor: doctor._id,
            status: 'completed'
        });

        const pending = await Appointment.countDocuments({
            doctor: doctor._id,
            status: 'pending'
        });

        const cancelled = await Appointment.countDocuments({
            doctor: doctor._id,
            status: 'cancelled'
        });

        const data = [
            { label: 'Completed', value: completed },
            { label: 'Pending', value: pending },
            { label: 'Cancelled', value: cancelled },
        ];

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get status distribution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching status distribution',
        });
    }
};

/**
 * Get doctor's pending appointment requests
 */
export const getDoctorRequests = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const appointments = await Appointment.find({
            doctor: doctor._id,
            status: 'scheduled'  // New appointments have 'scheduled' status
        })
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone profileImage' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { appointments },
        });
    } catch (error) {
        console.error('Get doctor requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment requests',
        });
    }
};

/**
 * Get doctor's upcoming appointments
 */
export const getDoctorUpcomingAppointments = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { limit = 10, page = 1 } = req.query;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            doctor: doctor._id,
            appointmentDate: { $gte: today },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone profileImage' }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ appointmentDate: 1 });

        const count = await Appointment.countDocuments({
            doctor: doctor._id,
            appointmentDate: { $gte: today },
            status: { $in: ['pending', 'confirmed'] }
        });

        res.status(200).json({
            success: true,
            data: {
                appointments,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get upcoming appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming appointments',
        });
    }
};

/**
 * Get doctor's past appointments
 */
export const getDoctorPastAppointments = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { limit = 20, page = 1 } = req.query;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            doctor: doctor._id,
            appointmentDate: { $lt: today },
        })
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone profileImage' }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ appointmentDate: -1 });

        const count = await Appointment.countDocuments({
            doctor: doctor._id,
            appointmentDate: { $lt: today },
        });

        res.status(200).json({
            success: true,
            data: {
                appointments,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get past appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching past appointments',
        });
    }
};

/**
 * Get doctor's today schedule
 */
export const getDoctorTodaySchedule = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint',
            });
        }

        const doctor = await Doctor.findOne({ user: id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            doctor: doctor._id,
            appointmentDate: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'pending', 'completed'] }
        })
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone profileImage' }
            })
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            data: { appointments },
        });
    } catch (error) {
        console.error('Get today schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching today schedule',
        });
    }
};

/**
 * Get appointment schedule for date range
 */
export const getAppointmentSchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { role, id } = req.user;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required',
            });
        }

        let query = {
            appointmentDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        };

        let doctor = null;
        if (role === 'doctor') {
            doctor = await Doctor.findOne({ user: id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found',
                });
            }
            query.doctor = doctor._id;
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone profileImage' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            data: {
                appointments,
                availability: doctor ? doctor.availability : []
            },
        });
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schedule',
        });
    }
};

/**
 * Start consultation
 */
export const startConsultation = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'in-progress', startedAt: new Date() },
            { new: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Emit socket event
        const patientUser = appointment.patient?.user;
        if (patientUser?._id) {
            const receiverSocketId = getReceiverSocketId(patientUser._id.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('appointment_updated', appointment);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Consultation started',
            data: appointment,
        });
    } catch (error) {
        console.error('Start consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting consultation',
        });
    }
};

/**
 * Complete consultation
 */
export const completeConsultation = async (req, res) => {
    try {
        const { notes, diagnosis, treatment } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status: 'completed',
                completedAt: new Date(),
                consultationNotes: notes,
                diagnosis,
                treatment,
            },
            { new: true }
        )
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Emit socket event
        const patientUser = appointment.patient?.user;
        if (patientUser?._id) {
            const receiverSocketId = getReceiverSocketId(patientUser._id.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('appointment_updated', appointment);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Consultation completed',
            data: appointment,
        });
    } catch (error) {
        console.error('Complete consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing consultation',
        });
    }
};
