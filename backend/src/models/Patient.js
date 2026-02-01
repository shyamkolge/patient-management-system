import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required'],
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: [true, 'Gender is required'],
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        emergencyContact: {
            name: {
                type: String,
                required: [true, 'Emergency contact name is required'],
            },
            relationship: String,
            phone: {
                type: String,
                required: [true, 'Emergency contact phone is required'],
            },
        },
        allergies: [String],
        chronicConditions: [String],
        currentMedications: [String],
        insuranceInfo: {
            provider: String,
            policyNumber: String,
            groupNumber: String,
        },
        profileImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual to calculate age
patientSchema.virtual('age').get(function () {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
