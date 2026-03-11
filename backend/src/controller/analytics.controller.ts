import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

// ─── Instructor Analytics ─────────────────────────────────────────────────────

export async function getInstructorAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;

        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                _count: { select: { enrollments: true, reviews: true } },
                reviews: { select: { rating: true } },
                schedules: { select: { dayOfWeek: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalCourses = courses.length;
        const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

        const allRatings = courses.flatMap(c => c.reviews.map(r => r.rating));
        const avgRating = allRatings.length > 0
            ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
            : 0;

        const courseBreakdown = courses.map(c => {
            const ratings = c.reviews.map(r => r.rating);
            const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            return {
                id: c.id,
                title: c.title,
                enrollments: c._count.enrollments,
                reviews: c._count.reviews,
                avgRating: parseFloat(avg.toFixed(1)),
                price: c.price,
            };
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                totalCourses,
                totalStudents,
                avgRating: parseFloat(avgRating.toFixed(1)),
                courseBreakdown,
            }
        });
    } catch (err) {
        next(err);
    }
}

// ─── Student Analytics ────────────────────────────────────────────────────────

export async function getStudentAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const studentId = req.user!.userId;

        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        instructor: { select: { id: true, username: true, avatarUrl: true } },
                        schedules: { select: { dayOfWeek: true, startTime: true, endTime: true } },
                        major: { select: { name: true } },
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        const totalEnrolled = enrollments.length;
        const activeCount = enrollments.filter(e => e.status === 'ACTIVE').length;
        const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;
        const droppedCount = enrollments.filter(e => e.status === 'DROPPED').length;

        const courseList = enrollments.map(e => ({
            enrollmentId: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            course: {
                id: e.course.id,
                title: e.course.title,
                instructor: e.course.instructor,
                major: e.course.major,
                schedules: e.course.schedules,
            }
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                totalEnrolled,
                activeCount,
                completedCount,
                droppedCount,
                courseList,
            }
        });
    } catch (err) {
        next(err);
    }
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

export async function getAdminAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const [
            totalUsers,
            studentCount,
            instructorCount,
            adminCount,
            totalCourses,
            activeEnrollments,
            completedEnrollments,
            totalReviews,
            pendingMatches,
            recentUsers,
            recentCourses,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.course.count(),
            prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
            prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
            prisma.review.count(),
            prisma.matchRequest.count({ where: { status: 'PENDING' } }),
            prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, username: true, email: true, role: true, createdAt: true }
            }),
            prisma.course.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true, title: true, createdAt: true,
                    instructor: { select: { username: true } },
                    _count: { select: { enrollments: true } }
                }
            }),
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                totalUsers,
                studentCount,
                instructorCount,
                adminCount,
                totalCourses,
                activeEnrollments,
                completedEnrollments,
                totalReviews,
                pendingMatches,
                recentUsers,
                recentCourses,
            }
        });
    } catch (err) {
        next(err);
    }
}
