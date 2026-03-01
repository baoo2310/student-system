import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { bio, hourlyRate, avatarUrl } = req.body;

        const updatedUser = await prisma.$transaction(async (tx) => {
            // Update User avatar if provided
            if (avatarUrl !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: { avatarUrl },
                });
            }

            // Upsert Profile
            const profile = await tx.profile.upsert({
                where: { userId },
                create: {
                    id: require('uuid').v4(), // Fallback if no profile exists for some reason
                    userId,
                    bio,
                    hourlyRate,
                },
                update: {
                    bio,
                    hourlyRate,
                },
            });

            return tx.user.findUnique({
                where: { id: userId },
                include: { profile: true },
            });
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
}

export async function updateUserMajors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { majorIds } = req.body as { majorIds: string[] };

        // Verify that all provided major IDs actually exist in the database
        if (majorIds.length > 0) {
            const existingMajors = await prisma.major.findMany({
                where: { id: { in: majorIds } },
            });

            if (existingMajors.length !== majorIds.length) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'One or more of the selected majors do not exist.',
                });
                return;
            }
        }

        await prisma.$transaction(async (tx) => {
            // Delete existing user majors
            await tx.userMajor.deleteMany({
                where: { userId },
            });

            // Insert new user majors
            if (majorIds.length > 0) {
                await tx.userMajor.createMany({
                    data: majorIds.map((majorId) => ({
                        userId,
                        majorId,
                    })),
                });
            }
        });

        // Fetch updated user with majors
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                majors: { include: { major: true } },
            },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User majors updated successfully.',
            data: updatedUser?.majors.map((um) => um.major) || [],
        });
    } catch (err) {
        next(err);
    }
}
