import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

// ─── Create Review ────────────────────────────────────────────────────────────

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const studentId = req.user!.userId;
        const { courseId, rating, comment } = req.body;

        // Verify course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        // Prevent instructor from reviewing own course
        if (course.instructorId === studentId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'You cannot review your own course.' });
            return;
        }

        // Check if student is enrolled
        const enrollment = await prisma.enrollment.findUnique({
            where: { studentId_courseId: { studentId, courseId } }
        });
        if (!enrollment) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'You must be enrolled in this course to review it.' });
            return;
        }

        // Check if already reviewed
        const existingReview = await prisma.review.findUnique({
            where: { studentId_courseId: { studentId, courseId } }
        });
        if (existingReview) {
            res.status(StatusCodes.CONFLICT).json({ success: false, message: 'You have already reviewed this course.' });
            return;
        }

        const review = await prisma.review.create({
            data: {
                id: uuidv4(),
                studentId,
                courseId,
                rating,
                comment: comment || null
            },
            include: {
                student: { select: { id: true, username: true, avatarUrl: true } }
            }
        });

        // Create notification for the course instructor
        await prisma.notification.create({
            data: {
                id: uuidv4(),
                userId: course.instructorId,
                type: 'COURSE_REVIEW',
                title: 'New Course Review',
                body: `${review.student?.username || 'A student'} left a ${rating}-star review on "${course.title}".`
            }
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Review submitted successfully.',
            data: review
        });
    } catch (err) {
        next(err);
    }
}

// ─── Get Course Reviews ───────────────────────────────────────────────────────

export async function getCourseReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { courseId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { courseId: String(courseId) },
            include: {
                student: { select: { id: true, username: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? +(totalRating / reviews.length).toFixed(1) : 0;

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                reviews,
                avgRating,
                totalReviews: reviews.length
            }
        });
    } catch (err) {
        next(err);
    }
}

// ─── Delete Review ────────────────────────────────────────────────────────────

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const reviewId = String(id);

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { course: { select: { instructorId: true } } }
        });

        if (!review) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Review not found.' });
            return;
        }

        // Only the review author or the course instructor can delete
        if (review.studentId !== userId && review.course.instructorId !== userId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized to delete this review.' });
            return;
        }

        await prisma.review.delete({ where: { id: reviewId } });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Review deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
}