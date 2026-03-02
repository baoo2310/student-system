import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
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
export function createMajor(req: Request, res: Response, next: NextFunction): void {
    const { name, description } = req.body;

    if (!name) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Major name is required.',
        });
        return;
    }

    prisma.major.create({
        data: {
            id: uuidv4(),
            name,
            description: description || null,
        }
    })
        .then((major) => {
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: major,
            });
        })
        .catch((err) => {
            if (err.code === 'P2002') {
                res.status(StatusCodes.CONFLICT).json({
                    success: false,
                    message: 'A subject with this name already exists.',
                });
            } else {
                next(err);
            }
        });
}
