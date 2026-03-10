import { Router } from 'express';
import { getMySchedule, createCourseSchedule } from '../controller/schedule.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my-schedule', getMySchedule);
router.post('/', createCourseSchedule);

export default router;
