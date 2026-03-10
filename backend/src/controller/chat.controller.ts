import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

// Get or create a conversation between two users
export async function getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'otherUserId is required.' });
            return;
        }

        if (userId === otherUserId) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Cannot chat with yourself.' });
            return;
        }

        // Check if conversation exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: otherUserId } } }
                ]
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } }
                    }
                }
            }
        });

        // Create if not exists
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    id: uuidv4(),
                    participants: {
                        create: [
                            { userId },
                            { userId: otherUserId }
                        ]
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: { select: { id: true, username: true, avatarUrl: true } }
                        }
                    }
                }
            });
        }

        res.status(StatusCodes.OK).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
}

export async function getMyConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId } }
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(StatusCodes.OK).json({ success: true, data: conversations });
    } catch (err) {
        next(err);
    }
}

export async function getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const conversationId = String(req.params.id);

        // Verify participant
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        });

        if (!isParticipant) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });

        res.status(StatusCodes.OK).json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const senderId = req.user!.userId;
        const conversationId = String(req.params.id);
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Message cannot be empty' });
            return;
        }

        // Verify participant
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId: senderId }
            }
        });

        if (!isParticipant) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const message = await prisma.message.create({
            data: {
                id: uuidv4(),
                conversationId,
                senderId,
                content
            },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        const io = req.app.get('io');
        if (io) {
            // Emit to the conversation room
            io.to(conversationId).emit('new_message', message);
        }

        // Notify other participants (typically one other person)
        const otherParticipants = await prisma.conversationParticipant.findMany({
            where: {
                conversationId,
                userId: { not: senderId }
            }
        });

        for (const p of otherParticipants) {
            const notification = await prisma.notification.create({
                data: {
                    id: uuidv4(),
                    userId: p.userId,
                    type: 'NEW_MESSAGE',
                    title: 'New Message',
                    body: `${message.sender.username} sent you a message.`
                }
            });

            if (io) {
                // Emit targeted notification to the other user's personal room
                io.to(p.userId).emit('new_notification', notification);
            }
        }

        res.status(StatusCodes.CREATED).json({ success: true, data: message });
    } catch (err) {
        next(err);
    }
}
