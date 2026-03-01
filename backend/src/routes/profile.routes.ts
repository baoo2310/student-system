import { Router } from 'express';
import { updateProfile, updateUserMajors } from '../controller/profile.controller';
import { profileUpdateSchema } from '../validation/profile.validation';
import { updateUserMajorsSchema } from '../validation/major.validation';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';

const router = Router();

// PUT /api/profile
// Protected route to update bio, hourlyRate, and avatarUrl
router.put('/', authenticate, validateRequest(profileUpdateSchema), updateProfile);

// PUT /api/profile/majors
// Protected route to set subjects/majors for the user
router.put('/majors', authenticate, validateRequest(updateUserMajorsSchema), updateUserMajors);

export default router;
