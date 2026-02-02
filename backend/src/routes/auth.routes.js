import express from 'express';
import { register, login, refreshAccessToken, logout, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, loginSchema, registerSchema } from '../middleware/validation.js';

import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', upload.single('profileImage'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, upload.single('profileImage'), updateProfile);

export default router;
