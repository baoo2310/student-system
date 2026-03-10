import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';

export async function getInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { search, minRate, maxRate, minRating, majorId, sortBy } = req.query;

        const whereClause: any = {
            role: UserRole.INSTRUCTOR,
            isActive: true
        };

        if (search) {
            whereClause.OR = [
                { username: { contains: String(search), mode: 'insensitive' } },
                { profile: { is: { bio: { contains: String(search), mode: 'insensitive' } } } }
            ];
        }

        if (majorId) {
            whereClause.majors = {
                some: { majorId: String(majorId) }
            };
        }

        if (minRate !== undefined || maxRate !== undefined) {
            whereClause.profile = {
                ...(whereClause.profile || {}),
                is: {
                    ...(whereClause.profile?.is || {}),
                    hourlyRate: {}
                }
            };
            if (minRate !== undefined) whereClause.profile.is.hourlyRate.gte = Number(minRate);
            if (maxRate !== undefined) whereClause.profile.is.hourlyRate.lte = Number(maxRate);
        }

        const instructors = await prisma.user.findMany({
            where: whereClause,
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
                },
                courses: {
                    select: {
                        reviews: { select: { rating: true } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let instructorsWithRating = instructors.map(instructor => {
            const allRatings = instructor.courses.flatMap(c => c.reviews.map(r => r.rating));
            const avgRating = allRatings.length > 0 ? +(allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : 0;
            const { courses, ...rest } = instructor;
            return { ...rest, avgRating, totalReviews: allRatings.length };
        });

        if (minRating !== undefined) {
            instructorsWithRating = instructorsWithRating.filter(i => i.avgRating >= Number(minRating));
        }

        if (sortBy) {
            switch (sortBy) {
                case 'rate_asc':
                    instructorsWithRating.sort((a, b) => Number(a.profile?.hourlyRate || 0) - Number(b.profile?.hourlyRate || 0));
                    break;
                case 'rate_desc':
                    instructorsWithRating.sort((a, b) => Number(b.profile?.hourlyRate || 0) - Number(a.profile?.hourlyRate || 0));
                    break;
                case 'rating_desc':
                    instructorsWithRating.sort((a, b) => b.avgRating - a.avgRating);
                    break;
                case 'newest':
                default:
                    break;
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: instructorsWithRating,
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
                },
                courses: {
                    select: {
                        reviews: { select: { rating: true } }
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

        const allRatings = instructor.courses.flatMap((c: any) => c.reviews.map((r: any) => r.rating));
        const avgRating = allRatings.length > 0 ? +(allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(1) : 0;
        const totalReviews = allRatings.length;
        const { courses, ...instructorData } = instructor;

        res.status(StatusCodes.OK).json({
            success: true,
            data: { ...instructorData, avgRating, totalReviews },
        });
    } catch (err) {
        next(err);
    }
}
