import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { DayOfWeek } from '@prisma/client';

export async function getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { majorId, search, minPrice, maxPrice, minRating, sortBy } = req.query;

        const whereClause: any = {};
        if (majorId) {
            whereClause.majorId = String(majorId);
        }
        if (search) {
            whereClause.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            whereClause.price = {};
            if (minPrice !== undefined) whereClause.price.gte = Number(minPrice);
            if (maxPrice !== undefined) whereClause.price.lte = Number(maxPrice);
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                instructor: {
                    select: { id: true, username: true, avatarUrl: true, profile: true }
                },
                major: true,
                schedules: true,
                reviews: {
                    select: { rating: true }
                },
                _count: {
                    select: { enrollments: { where: { status: 'ACTIVE' } }, reviews: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Compute avg rating for each course
        let coursesWithRating = courses.map(c => {
            const ratings = c.reviews.map(r => r.rating);
            const avgRating = ratings.length > 0 ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
            const { reviews, ...rest } = c;
            return { ...rest, avgRating };
        });

        // Post-DB filters and sorting
        if (minRating !== undefined) {
            coursesWithRating = coursesWithRating.filter(c => c.avgRating >= Number(minRating));
        }

        if (sortBy) {
            switch (sortBy) {
                case 'price_asc':
                    coursesWithRating.sort((a, b) => Number(a.price) - Number(b.price));
                    break;
                case 'price_desc':
                    coursesWithRating.sort((a, b) => Number(b.price) - Number(a.price));
                    break;
                case 'rating_desc':
                    coursesWithRating.sort((a, b) => b.avgRating - a.avgRating);
                    break;
                case 'newest':
                default:
                    // DB already sorts by createdAt desc
                    break;
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: coursesWithRating
        });
    } catch (err) {
        next(err);
    }
}

export async function getInstructorCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;

        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                major: true,
                schedules: true,
                _count: {
                    select: { enrollments: { where: { status: 'ACTIVE' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: courses
        });
    } catch (err) {
        next(err);
    }
}

export async function getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const courseId = String(id);

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: {
                    select: { id: true, username: true, avatarUrl: true, profile: true }
                },
                major: true,
                schedules: {
                    orderBy: { dayOfWeek: 'asc' }
                },
                reviews: {
                    include: {
                        student: { select: { id: true, username: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { enrollments: { where: { status: 'ACTIVE' } }, reviews: true }
                }
            }
        });

        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: course
        });
    } catch (err) {
        next(err);
    }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { title, description, price, majorId } = req.body;

        // Verify major exists if provided
        if (majorId) {
            const major = await prisma.major.findUnique({ where: { id: majorId } });
            if (!major) {
                res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Major not found.' });
                return;
            }
        }

        const course = await prisma.course.create({
            data: {
                id: uuidv4(),
                instructorId,
                title,
                description,
                price,
                majorId
            },
            include: { major: true }
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Course created successfully.',
            data: course
        });
    } catch (err) {
        next(err);
    }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { id } = req.params;
        const courseId = String(id);
        const { title, description, price, majorId } = req.body;

        // Verify ownership
        const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
        if (!existingCourse) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        if (existingCourse.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized.' });
            return;
        }

        // Verify major exists if provided
        if (majorId) {
            const major = await prisma.major.findUnique({ where: { id: majorId } });
            if (!major) {
                res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Major not found.' });
                return;
            }
        }

        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: { title, description, price, majorId },
            include: { major: true }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Course updated successfully.',
            data: updatedCourse
        });
    } catch (err) {
        next(err);
    }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { id } = req.params;
        const courseId = String(id);

        const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
        if (!existingCourse) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        if (existingCourse.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized.' });
            return;
        }

        await prisma.course.delete({ where: { id: courseId } });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Course deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
}

// ─── Schedule Management ──────────────────────────────────────────────────────

export async function addCourseSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { id } = req.params;
        const courseId = String(id);
        const { dayOfWeek, startTime, endTime, meetingLink } = req.body;

        // Verify course ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        if (course.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized.' });
            return;
        }

        // Convert ISO strings to Date objects for time fields
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid start or end time format.' });
            return;
        }

        if (startDate >= endDate) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'End time must be after start time.' });
            return;
        }

        const schedule = await prisma.courseSchedule.create({
            data: {
                id: uuidv4(),
                courseId: courseId,
                dayOfWeek: dayOfWeek as DayOfWeek,
                startTime: startDate,
                endTime: endDate,
                meetingLink
            }
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Schedule added successfully.',
            data: schedule
        });
    } catch (err) {
        next(err);
    }
}

export async function removeCourseSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const { id, scheduleId } = req.params;
        const courseId = String(id);
        const schedId = String(scheduleId);

        // Verify course ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Course not found.' });
            return;
        }

        if (course.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized.' });
            return;
        }

        // Verify schedule exists and belongs to this course
        const schedule = await prisma.courseSchedule.findUnique({ where: { id: schedId } });
        if (!schedule || schedule.courseId !== courseId) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Schedule not found.' });
            return;
        }

        await prisma.courseSchedule.delete({ where: { id: schedId } });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Schedule removed successfully.'
        });
    } catch (err) {
        next(err);
    }
}
