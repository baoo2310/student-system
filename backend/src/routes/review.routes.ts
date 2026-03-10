import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';
import { createReviewSchema } from '../validation/review.validation';
import {
    createReview,
    getCourseReviews,
    deleteReview
} from '../controller/review.controller';

const router = Router();

// Create a review (authenticated students only)
router.post('/', authenticate, validateRequest(createReviewSchema), createReview);

// Get reviews for a specific course
router.get('/course/:courseId', authenticate, getCourseReviews);

// Delete a review
router.delete('/:id', authenticate, deleteReview);

export default router;
