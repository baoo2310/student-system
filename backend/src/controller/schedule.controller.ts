import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { DayOfWeek } from '@prisma/client';
import { io } from '../index';

// Maps Prisma DayOfWeek enum values to the 3-letter codes the frontend uses
const DAY_ABBREV: Record<string, string> = {
    MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED',
    THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'SAT', SUNDAY: 'SUN',
};

// Format a Date (or ISO string) to "HH:mm"
function formatTime(value: Date | string): string {
    const d = value instanceof Date ? value : new Date(value);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

export async function getMySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        let rawSchedules: any[] = [];

        if (role === 'INSTRUCTOR') {
            // Instructors: get schedule from courses they teach
            const courses = await prisma.course.findMany({
                where: { instructorId: userId },
                include: { schedules: true }
            });
            rawSchedules = courses.flatMap(c =>
                c.schedules.map(s => ({ ...s, courseDetails: { id: c.id, title: c.title } }))
            );
        } else if (role === 'STUDENT') {
            // Students: get schedule from active enrollments
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: userId, status: 'ACTIVE' },
                include: { course: { include: { schedules: true } } }
            });
            rawSchedules = enrollments.flatMap(e =>
                e.course.schedules.map(s => ({
                    ...s,
                    courseDetails: { id: e.course.id, title: e.course.title }
                }))
            );
        }

        // Normalise fields for the frontend: "HH:mm" times + 3-letter day codes
        const schedules = rawSchedules.map(s => ({
            ...s,
            startTime: formatTime(s.startTime),
            endTime: formatTime(s.endTime),
            dayOfWeek: DAY_ABBREV[s.dayOfWeek] ?? s.dayOfWeek,
        }));

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
        // Must use setUTCHours so that getUTCHours() in formatTime() reads back the same value
        const [startH, startM] = startTime.split(':');
        const [endH, endM] = endTime.split(':');
        const startDate = new Date(0); // epoch base
        startDate.setUTCHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

        const endDate = new Date(0);
        endDate.setUTCHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

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

        // Notify enrolled students
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId, status: 'ACTIVE' },
            select: { studentId: true }
        });

        const notificationsList = enrollments.map(e => ({
            id: uuidv4(),
            userId: e.studentId,
            type: 'SYSTEM',
            title: 'New Class Session Added',
            body: `A new session for "${course.title}" on ${dayOfWeek} has been added to your schedule.`,
        }));

        if (notificationsList.length > 0) {
            await prisma.notification.createMany({ data: notificationsList });

            // Emit via WebSocket to each student
            notificationsList.forEach(notif => {
                io.to(notif.userId).emit('new_notification', notif);
            });
        }

        res.status(StatusCodes.CREATED).json({ success: true, data: newSchedule });
    } catch (err) {
        next(err);
    }
}
