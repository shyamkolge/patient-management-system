import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import medicalRecordRoutes from './routes/medicalRecord.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Patient Records Management System API',
        version: '1.0.0',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
});

export default app;
