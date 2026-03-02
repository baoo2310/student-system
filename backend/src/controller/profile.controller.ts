import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { bio, hourlyRate, avatarUrl, oldPassword, newPassword } = req.body;

        const updatedUser = await prisma.$transaction(async (tx) => {
            const updateData: any = {};

            if (avatarUrl !== undefined) {
                updateData.avatarUrl = avatarUrl;
            }

            if (oldPassword && newPassword) {
                const user = await tx.user.findUnique({
                    where: { id: userId }
                });

                if (!user) {
                    throw new Error('User not found');
                }

                const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
                if (!isMatch) {
                    throw new Error('INVALID_PASSWORD');
                }

                updateData.passwordHash = await bcrypt.hash(newPassword, 12);
            }

            // Update User avatar and/or password if provided
            if (Object.keys(updateData).length > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: updateData,
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
    } catch (err: any) {
        if (err.message === 'INVALID_PASSWORD') {
            res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'The current password you entered is incorrect.'
            });
            return;
        }
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
