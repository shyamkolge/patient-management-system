import razorpay from '../utils/razorpay.js';
import Doctor from '../models/Doctor.js';

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
