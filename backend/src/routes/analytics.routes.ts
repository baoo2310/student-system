import { Router } from 'express';
import { getInstructorAnalytics, getStudentAnalytics, getAdminAnalytics } from '../controller/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/instructor', getInstructorAnalytics);
router.get('/student', getStudentAnalytics);
router.get('/admin', getAdminAnalytics);

export default router;
