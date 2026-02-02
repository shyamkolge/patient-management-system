import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;
