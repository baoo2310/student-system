import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { role, active, search } = req.query;

        const whereClause: any = {};
        if (role) whereClause.role = String(role).toUpperCase();
        if (active !== undefined) whereClause.isActive = active === 'true';
        if (search) {
            whereClause.OR = [
                { username: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                avatarUrl: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const adminId = req.user!.userId;
        const targetUserId = String(req.params.id);
        const newRole = req.body.role as UserRole;

        if (adminId === targetUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'You cannot change your own role.' });
            return;
        }

        if (!Object.values(UserRole).includes(newRole)) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid role provided.' });
            return;
        }

        const user = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
            select: { id: true, username: true, role: true }
        });

        res.status(StatusCodes.OK).json({ success: true, message: `User role updated to ${newRole}`, data: user });
    } catch (err) {
        next(err);
    }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const adminId = req.user!.userId;
        const targetUserId = String(req.params.id);

        if (adminId === targetUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'You cannot deactivate yourself.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found.' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: !user.isActive },
            select: { id: true, username: true, isActive: true }
        });

        const statusStr = updatedUser.isActive ? 'activated' : 'deactivated';
        res.status(StatusCodes.OK).json({ success: true, message: `User successfully ${statusStr}.`, data: updatedUser });
    } catch (err) {
        next(err);
    }
}

export async function getPlatformStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const [totalUsers, totalCourses, activeEnrollments, pendingMatches] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
            prisma.matchRequest.count({ where: { status: 'PENDING' } })
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                activeEnrollments,
                pendingMatches
            }
        });
    } catch (err) {
        next(err);
    }
}
