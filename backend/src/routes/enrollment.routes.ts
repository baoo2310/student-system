import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import {
    createEnrollmentSchema,
    updateEnrollmentStatusSchema
} from '../validation/enrollment.validation';
import {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
    updateEnrollmentStatus
} from '../controller/enrollment.controller';

const router = Router();

// Student routes
router.post(
    '/',
    authenticate,
    authorize(UserRole.STUDENT),
    validateRequest(createEnrollmentSchema),
    enrollInCourse
);

router.get(
    '/my-enrollments',
    authenticate,
    authorize(UserRole.STUDENT),
    getMyEnrollments
);

// Instructor routes
router.get(
    '/course/:courseId',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    getCourseEnrollments
);

router.put(
    '/:id/status',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    validateRequest(updateEnrollmentStatusSchema),
    updateEnrollmentStatus
);

export default router;
