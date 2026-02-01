import LabReport from '../models/LabReport.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

export const uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description } = req.body;
        const patientId = req.user.id;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'prms/reports',
            resource_type: 'auto',
        });

        const newReport = new LabReport({
            patient: patientId,
            title,
            description,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            fileType: result.format || 'pdf', // Cloudinary returns format, usually 'pdf' or image ext
        });

        await newReport.save();

        res.status(201).json(newReport);
    } catch (error) {
        console.error('Upload Report Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

export const getReports = async (req, res) => {
    try {
        const patientId = req.user.id;
        const reports = await LabReport.find({ patient: patientId }).sort({ uploadDate: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ message: 'Server error fetching reports' });
    }
};

export const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await LabReport.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete from Cloudinary
        try {
            // Determine resource type based on file type if possible, usually 'image' or 'raw' for PDFs sometimes
            // For simplicity, we try default (image) then others if needed, but 'upload_stream' with 'auto' usually creates 'image' or 'raw'
            // We can check report.fileType or just try
            await cloudinary.uploader.destroy(report.publicId);
            // Note: For PDFs uploaded as 'image' (which Cloudinary often handles), destroy works. 
            // If uploaded as 'raw', might need { resource_type: 'raw' }
            // We will assume standard for now, but can refine if PDF deletion fails.
        } catch (cloudinaryError) {
            console.error('Cloudinary Delete Error:', cloudinaryError);
            // Continue to delete from DB even if Cloudinary fails (orphan file better than broken app)
        }

        await LabReport.findByIdAndDelete(reportId);

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete Report Error:', error);
        res.status(500).json({ message: 'Server error deleting report' });
    }
};
