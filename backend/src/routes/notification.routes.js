import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
