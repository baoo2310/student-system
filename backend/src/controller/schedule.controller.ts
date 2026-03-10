import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { DayOfWeek } from '@prisma/client';

export async function getMySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        let schedules: any[] = [];

        if (role === 'INSTRUCTOR') {
            // Instructors: get schedule from courses they teach
            const courses = await prisma.course.findMany({
                where: { instructorId: userId },
                include: {
                    schedules: true
                }
            });
            schedules = courses.flatMap(c =>
                c.schedules.map(s => ({
                    ...s,
                    courseDetails: { id: c.id, title: c.title }
                }))
            );
        } else if (role === 'STUDENT') {
            // Students: get schedule from active enrollments
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: userId, status: 'ACTIVE' },
                include: {
                    course: {
                        include: { schedules: true }
                    }
                }
            });
            schedules = enrollments.flatMap(e =>
                e.course.schedules.map(s => ({
                    ...s,
                    courseDetails: { id: e.course.id, title: e.course.title }
                }))
            );
        }

        res.status(StatusCodes.OK).json({ success: true, data: schedules });
    } catch (err) {
        next(err);
    }
}

export async function createCourseSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;
        const { courseId, dayOfWeek, startTime, endTime, meetingLink } = req.body;

        if (role !== 'INSTRUCTOR') {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Only instructors can create schedules.' });
            return;
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.instructorId !== userId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Not authorized or course not found.' });
            return;
        }

        // Parse HH:mm to full Date using dummy date for time storage
        const [startH, startM] = startTime.split(':');
        const [endH, endM] = endTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

        const endDate = new Date();
        endDate.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

        const newSchedule = await prisma.courseSchedule.create({
            data: {
                id: uuidv4(),
                courseId,
                dayOfWeek: dayOfWeek as DayOfWeek,
                startTime: startDate,
                endTime: endDate,
                meetingLink: meetingLink || null
            }
        });

        res.status(StatusCodes.CREATED).json({ success: true, data: newSchedule });
    } catch (err) {
        next(err);
    }
}
