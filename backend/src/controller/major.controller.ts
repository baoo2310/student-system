import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

export async function getAllMajors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const majors = await prisma.major.findMany({
            orderBy: { name: 'asc' },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: majors,
        });
    } catch (err) {
        next(err);
    }
}
