import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

export async function createMatchRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const studentId = req.user!.userId;
        const { instructorId, majorId, message } = req.body;

        // Ensure the instructor exists and is actually an instructor
        const instructor = await prisma.user.findFirst({
            where: { id: instructorId, role: 'INSTRUCTOR' }
        });

        if (!instructor) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid Instructor ID.' });
            return;
        }

        // Prevent users from requesting themselves
        if (studentId === instructorId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Cannot request a match with yourself.' });
            return;
        }

        // Check if an active/pending request already exists between them
        const existingRequest = await prisma.matchRequest.findFirst({
            where: {
                studentId,
                instructorId,
                status: 'PENDING'
            }
        });

        if (existingRequest) {
            res.status(StatusCodes.CONFLICT).json({ success: false, message: 'You already have a pending request with this instructor.' });
            return;
        }

        // Create the match request
        const matchRequest = await prisma.matchRequest.create({
            data: {
                id: uuidv4(),
                studentId,
                instructorId,
                majorId: majorId || null,
                message: message || null,
                status: 'PENDING'
            },
            include: {
                instructor: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                },
                student: {
                    select: { id: true, username: true }
                },
                major: true
            }
        });

        // Notify Instructor
        await prisma.notification.create({
            data: {
                id: uuidv4(),
                userId: instructorId,
                type: 'MATCH_REQUEST',
                title: 'New Match Request',
                body: `${matchRequest.student.username} sent you a match request.`
            }
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            data: matchRequest,
            message: 'Match request sent successfully.'
        });
    } catch (err) {
        next(err);
    }
}

export async function updateMatchStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructorId = req.user!.userId;
        const id = req.params.id as string;
        const { status } = req.body; // ACCEPTED, REJECTED, COMPLETED

        const matchRequest = await prisma.matchRequest.findUnique({
            where: { id }
        });

        if (!matchRequest) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Match request not found.' });
            return;
        }

        // Only the requested instructor can update the status
        if (matchRequest.instructorId !== instructorId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized to update this request.' });
            return;
        }

        const updatedRequest = await prisma.matchRequest.update({
            where: { id },
            data: { status },
            include: {
                student: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                },
                instructor: {
                    select: { id: true, username: true }
                }
            }
        });

        // Notify Student
        await prisma.notification.create({
            data: {
                id: uuidv4(),
                userId: updatedRequest.studentId,
                type: status === 'ACCEPTED' ? 'MATCH_ACCEPTED' : 'SYSTEM',
                title: `Match Request ${status}`,
                body: `${updatedRequest.instructor.username} has ${status.toLowerCase()} your match request.`
            }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: updatedRequest,
            message: `Match request ${status.toLowerCase()} successfully.`
        });
    } catch (err) {
        next(err);
    }
}

export async function getUserMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        const matches = await prisma.matchRequest.findMany({
            where: role === 'INSTRUCTOR' ? { instructorId: userId } : { studentId: userId },
            include: {
                student: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                },
                instructor: {
                    select: { id: true, username: true, email: true, avatarUrl: true }
                },
                major: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: matches
        });
    } catch (err) {
        next(err);
    }
}

export async function getAvailableInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { majorId } = req.query;

        const whereClause: any = { role: 'INSTRUCTOR', isActive: true };

        if (majorId) {
            whereClause.majors = {
                some: { majorId: String(majorId) }
            };
        }

        const instructors = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                profile: {
                    select: { bio: true, hourlyRate: true }
                },
                majors: {
                    include: { major: true }
                }
            }
        });

        // Format the response to flatten the majors array similar to how getMe does it
        const formattedInstructors = instructors.map(inst => ({
            ...inst,
            majors: inst.majors.map(um => um.major)
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            data: formattedInstructors
        });
    } catch (err) {
        next(err);
    }
}
