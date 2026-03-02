import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getPlatformStats
} from '../controller/admin.controller';

const router = Router();

// All routes require authentication AND Admin role
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);

export default router;
