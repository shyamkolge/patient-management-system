import { z } from 'zod';

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error during validation',
            });
        }
    };
};

// Common validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['admin', 'doctor', 'patient']).optional(),
});

export const appointmentSchema = z.object({
    patient: z.string().min(1, 'Patient is required'),
    doctor: z.string().min(1, 'Doctor is required'),
    appointmentDate: z.string().min(1, 'Appointment date is required'),
    appointmentTime: z.string().min(1, 'Appointment time is required'),
    reason: z.string().min(1, 'Reason for visit is required'),
    notes: z.string().optional(),
});

export const medicalRecordSchema = z.object({
    patient: z.string().min(1, 'Patient is required'),
    visitDate: z.string().optional(),
    chiefComplaint: z.string().min(1, 'Chief complaint is required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    treatment: z.string().min(1, 'Treatment is required'),
    notes: z.string().optional(),
});

export const prescriptionSchema = z.object({
    patient: z.string().min(1, 'Patient is required'),
    medications: z.array(z.object({
        name: z.string().min(1, 'Medication name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
        instructions: z.string().optional(),
    })).min(1, 'At least one medication is required'),
    diagnosis: z.string().optional(),
    instructions: z.string().optional(),
});
