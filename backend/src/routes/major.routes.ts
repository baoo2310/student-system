import { Router } from 'express';
import { getAllMajors } from '../controller/major.controller';

const router = Router();

// GET /api/majors
// Public route to fetch all available majors for dropdowns/checklists
router.get('/', getAllMajors);

export default router;
