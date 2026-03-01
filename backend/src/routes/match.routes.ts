import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';
import { createMatchRequestSchema, updateMatchRequestStatusSchema } from '../validation/matchRequest.validation';
import {
    createMatchRequest,
    updateMatchStatus,
    getUserMatches,
    getAvailableInstructors
} from '../controller/match.controller';

const router = Router();

// Retrieve all instructors (can be filtered by ?majorId=uuid)
router.get('/instructors', authenticate, getAvailableInstructors);

// Create a new match request
router.post(
    '/',
    authenticate,
    validateRequest(createMatchRequestSchema),
    createMatchRequest
);

// Get all matches for the current user
router.get('/', authenticate, getUserMatches);

// Update a match request status (Instructor only)
router.put(
    '/:id/status',
    authenticate,
    validateRequest(updateMatchRequestStatusSchema),
    updateMatchStatus
);

export default router;
