import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';

export async function getInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const instructors = await prisma.user.findMany({
            where: {
                role: UserRole.INSTRUCTOR,
                isActive: true // optionally only show active instructors
            },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                profile: {
                    select: {
                        bio: true,
                        hourlyRate: true,
                    }
                },
                majors: {
                    include: {
                        major: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: instructors,
        });
    } catch (err) {
        next(err);
    }
}

export async function getInstructorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;

        const instructor = await prisma.user.findFirst({
            where: {
                id: String(id),
                role: UserRole.INSTRUCTOR,
            },
            select: {
                id: true,
                username: true,
                email: true, // we might want to let students contact them
                avatarUrl: true,
                createdAt: true,
                profile: true, // all profile fields
                majors: {
                    include: {
                        major: true
                    }
                }
            }
        });

        if (!instructor) {
            res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Instructor not found',
            });
            return;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: instructor,
        });
    } catch (err) {
        next(err);
    }
}
