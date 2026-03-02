import { Router } from 'express';
import { getAllMajors, createMajor } from '../controller/major.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /api/majors
// Public route to fetch all available majors for dropdowns/checklists
router.get('/', getAllMajors);

// POST /api/majors
// Instructor only route to create a new major
router.post('/', authenticate, authorize('INSTRUCTOR'), createMajor);

export default router;
