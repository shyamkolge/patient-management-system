import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    fileType: {
        type: String, // 'image/jpeg', 'application/pdf', etc.
        required: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
});

const LabReport = mongoose.model('LabReport', labReportSchema);

export default LabReport;
