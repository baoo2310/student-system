import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

export async function enrollInCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const studentId = req.user!.userId;
        const { courseId } = req.body;

        // Verify course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        if (existingEnrollment) {
            res.status(StatusCodes.CONFLICT).json({ success: false, message: 'You are already enrolled in this course.' });
            return;
        }

        // Prevent instructor from enrolling in their own course
        if (course.instructorId === studentId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'You cannot enroll in your own course.' });
            return;
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                id: uuidv4(),
                studentId,
                courseId,
                status: 'ACTIVE'
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        instructor: { select: { id: true, username: true } }
                    }
                }
            }
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully enrolled in course.',
            data: enrollment
        });
    } catch (err) {
        next(err);
    }
}

export async function getMyEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const studentId = req.user!.userId;

        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        instructor: { select: { id: true, username: true, avatarUrl: true } },
                        schedules: { orderBy: { dayOfWeek: 'asc' } },
                        major: true
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: enrollments
        });
    } catch (err) {
        next(err);
    }
}

export async function getCourseEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { courseId } = req.params;
        const cId = String(courseId);

        // Verify ownership
        const course = await prisma.course.findUnique({ where: { id: cId } });
        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        if (course.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized. You do not own this course.' });
            return;
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: cId },
            include: {
                student: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: enrollments
        });
    } catch (err) {
        next(err);
    }
}

export async function updateEnrollmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { id } = req.params;
        const enrollmentId = String(id);
        const { status } = req.body; // ACTIVE, COMPLETED, DROPPED

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { course: true }
        });

        if (!enrollment) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Enrollment not found.' });
            return;
        }

        // Only the course instructor can update status
        if (enrollment.course.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized. You do not own this course.' });
            return;
        }

        const updatedEnrollment = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status: status as EnrollmentStatus },
            include: {
                student: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                }
            }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: `Enrollment marked as ${status}.`,
            data: updatedEnrollment
        });
    } catch (err) {
        next(err);
    }
}
