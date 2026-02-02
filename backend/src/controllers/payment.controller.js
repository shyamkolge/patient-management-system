import razorpay from '../utils/razorpay.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { sendPaymentReceiptEmail } from '../utils/email.js';

/**
 * Create a new order
 * Route: POST /api/payment/order
 */
export const createOrder = async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Amount in smallest currency unit (paise for INR)
        // Default to 500 INR if not set
        const amount = (doctor.consultationFee || 500) * 100;
        const currency = 'INR';

        const options = {
            amount: amount,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1, // Auto capture
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID // Send public key to frontend
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to create order',
            error: error.message
        });
    }
};

/**
 * Verify payment and send receipt email
 * Route: POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature, doctorId } = req.body;
        const userId = req.user?.id;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification details'
            });
        }

        // Verify signature
        const crypto = await import('crypto');
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Get patient and doctor details
        const patient = await Patient.findOne({ user: userId }).populate('user');
        const doctor = await Doctor.findById(doctorId).populate('user');

        if (!patient || !doctor) {
            return res.status(404).json({
                success: false,
                message: 'Patient or Doctor not found'
            });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(paymentId);

        // Send payment receipt email
        const emailResult = await sendPaymentReceiptEmail(
            patient.user.email,
            `${patient.user.firstName} ${patient.user.lastName}`,
            {
                paymentId: paymentId,
                orderId: orderId,
                amount: payment.amount,
                doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
                paymentDate: new Date(payment.created_at * 1000),
                paymentMethod: payment.method || 'Razorpay',
            }
        );

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            emailSent: emailResult.success,
            payment: {
                id: paymentId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};
