import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
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
        medicalRecord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicalRecord',
        },
        medications: [
            {
                name: {
                    type: String,
                    required: [true, 'Medication name is required'],
                },
                dosage: {
                    type: String,
                    required: [true, 'Dosage is required'],
                },
                frequency: {
                    type: String,
                    required: [true, 'Frequency is required'],
                },
                duration: {
                    type: String,
                    required: [true, 'Duration is required'],
                },
                instructions: String,
            },
        ],
        diagnosis: String,
        instructions: String,
        issueDate: {
            type: Date,
            default: Date.now,
        },
        validUntil: Date,
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
prescriptionSchema.index({ patient: 1, issueDate: -1 });
prescriptionSchema.index({ doctor: 1, issueDate: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
