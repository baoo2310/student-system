import { Router } from 'express';
import { getInstructors, getInstructorById } from '../controller/instructor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/instructors
// Public route to fetch all active instructors
router.get('/', authenticate, getInstructors);

// GET /api/instructors/:id
// Public route to fetch a single instructor's details
router.get('/:id', authenticate, getInstructorById);

export default router;
