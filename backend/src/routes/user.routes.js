import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/role', changeUserRole);

export default router;
