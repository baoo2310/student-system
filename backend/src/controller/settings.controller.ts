import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found.' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Incorrect current password.' });
            return;
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        res.status(StatusCodes.OK).json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        next(err);
    }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { confirmPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found.' });
            return;
        }

        const isMatch = await bcrypt.compare(confirmPassword, user.passwordHash);
        if (!isMatch) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Incorrect password.' });
            return;
        }

        // Hard delete user (cascade will handle related records in Profile, Majors, Enrollments, Courses)
        await prisma.user.delete({ where: { id: userId } });

        // Clear auth cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh'
        });

        res.status(StatusCodes.OK).json({ success: true, message: 'Account permanently deleted.' });
    } catch (err) {
        next(err);
    }
}
