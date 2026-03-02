import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import {
    createCourseSchema,
    updateCourseSchema,
    createScheduleSchema
} from '../validation/course.validation';
import {
    getAllCourses,
    getInstructorCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addCourseSchedule,
    removeCourseSchedule
} from '../controller/course.controller';

const router = Router();

// Public / Student accessible
router.get('/', authenticate, getAllCourses);
router.get('/my-courses', authenticate, authorize(UserRole.INSTRUCTOR), getInstructorCourses);
router.get('/:id', authenticate, getCourseById);

// Instructor only
router.post(
    '/',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    validateRequest(createCourseSchema),
    createCourse
);

router.put(
    '/:id',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    validateRequest(updateCourseSchema),
    updateCourse
);

router.delete(
    '/:id',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    deleteCourse
);

// Schedule Management (Instructor only)
router.post(
    '/:id/schedules',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    validateRequest(createScheduleSchema),
    addCourseSchedule
);

router.delete(
    '/:id/schedules/:scheduleId',
    authenticate,
    authorize(UserRole.INSTRUCTOR),
    removeCourseSchedule
);

export default router;
