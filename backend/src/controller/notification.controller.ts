import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: notifications
        });
    } catch (err) {
        next(err);
    }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        // Verify ownership
        const notification = await prisma.notification.findUnique({ where: { id: String(id) } });

        if (!notification) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Notification not found' });
            return;
        }

        if (notification.userId !== userId) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id: String(id) },
            data: { isRead: true }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: updated
        });
    } catch (err) {
        next(err);
    }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        next(err);
    }
}
