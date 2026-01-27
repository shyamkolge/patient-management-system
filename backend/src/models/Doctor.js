import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        specialization: {
            type: String,
            required: [true, 'Specialization is required'],
        },
        qualifications: [
            {
                degree: String,
                institution: String,
                year: Number,
            },
        ],
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            unique: true,
        },
        experience: {
            type: Number, // Years of experience
            required: [true, 'Experience is required'],
        },
        department: String,
        consultationFee: {
            type: Number,
            default: 0,
        },
        availability: [
            {
                day: {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                },
                startTime: String, // Format: "09:00"
                endTime: String,   // Format: "17:00"
            },
        ],
        bio: String,
    },
    {
        timestamps: true,
    }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
