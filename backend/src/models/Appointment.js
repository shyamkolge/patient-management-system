import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Patient is required'],
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Doctor is required'],
        },
        appointmentDate: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        appointmentTime: {
            type: String, // Format: "14:30"
            required: [true, 'Appointment time is required'],
        },
        status: {
            type: String,
            enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
            default: 'scheduled',
        },
        reason: {
            type: String,
            required: [true, 'Reason for visit is required'],
        },
        notes: String,
        symptoms: [String],
        duration: {
            type: Number, // Duration in minutes
            default: 30,
        },
        cancelReason: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        paymentMode: {
            type: String,
            enum: ['online', 'offline'],
            default: 'offline',
        },
        transactionId: {
            type: String,
        },
        consultationNotes: String,
        diagnosis: String,
        treatment: String,
        startedAt: Date,
        completedAt: Date,
        type: {
            type: String,
            enum: ['in-person', 'video', 'phone'],
            default: 'in-person',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
