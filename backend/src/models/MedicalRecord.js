import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
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
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        visitDate: {
            type: Date,
            required: [true, 'Visit date is required'],
            default: Date.now,
        },
        chiefComplaint: {
            type: String,
            required: [true, 'Chief complaint is required'],
        },
        symptoms: [String],
        observations: String, // Doctor's clinical observations
        diagnosis: {
            type: String,
            required: [true, 'Diagnosis is required'],
        },
        treatment: {
            type: String,
            required: [true, 'Treatment is required'],
        },
        vitalSigns: {
            bloodPressure: String, // e.g., "120/80"
            heartRate: Number,
            temperature: Number,
            weight: Number,
            height: Number,
            oxygenSaturation: Number,
        },
        labResults: [
            {
                testName: String,
                result: String,
                date: Date,
                fileUrl: String,
            },
        ],
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
                uploadDate: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        notes: String,
        followUpDate: Date,
        // Consultation tracking
        consultationStatus: {
            type: String,
            enum: ['ONGOING', 'COMPLETED', 'LOCKED'],
            default: 'ONGOING',
        },
        consultationStartTime: {
            type: Date,
            default: Date.now,
        },
        consultationEndTime: Date,
        consultationDuration: Number, // in minutes
        consultationSummary: String,
        // Payment tracking
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAYMENT_RECEIVED', 'COMPLETED'],
            default: 'PENDING',
        },
        paymentAmount: Number,
        paymentMode: {
            type: String,
            enum: ['online', 'offline', 'insurance'],
        },
        invoiceGenerated: {
            type: Boolean,
            default: false,
        },
        invoiceUrl: String,
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
