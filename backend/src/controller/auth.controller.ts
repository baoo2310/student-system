import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../lib/jwt.provider';
import { sendVerificationEmail } from '../lib/mail.provider';
import { RegisterBody, LoginBody } from '../model/user.types';
import jwt from 'jsonwebtoken';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeTokenPair(userId: string, email: string, role: string) {
    const payload = { userId, email, role };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { username, email, password, role = 'STUDENT' } = req.body as RegisterBody;

        // Check if email or username already exists
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existing) {
            res.status(StatusCodes.CONFLICT).json({
                success: false,
                message:
                    existing.email === email
                        ? 'An account with this email already exists.'
                        : 'This username is already taken.',
            });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate email verification token
        const emailVerificationToken = randomBytes(32).toString('hex');

        const userId = uuidv4();
        const profileId = uuidv4();

        // Create user + profile in a DB transaction (isActive = false by default)
        const user = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    username: username.trim(),
                    email: email.toLowerCase(),
                    passwordHash,
                    role: role as 'STUDENT' | 'INSTRUCTOR',
                    isActive: false,
                    emailVerificationToken,
                },
            });

            await tx.profile.create({
                data: {
                    id: profileId,
                    userId: newUser.id,
                },
            });

            return newUser;
        });

        // Send verification email (non-blocking — don't fail register if email fails)
        sendVerificationEmail(user.email, emailVerificationToken).catch((err) =>
            console.error('[MailProvider] Failed to send verification email:', err)
        );

        // Generate token pair
        const tokens = makeTokenPair(user.id, user.email, user.role);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            data: {
                accessToken: tokens.accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    avatarUrl: user.avatarUrl,
                },
            },
        });
    } catch (err) {
        next(err);
    }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body as LoginBody;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid email or password.' });
            return;
        }

        // Verify password first (prevents user enumeration via timing)
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid email or password.' });
            return;
        }

        // Check if email is verified
        if (!user.isActive) {
            res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox.',
            });
            return;
        }

        // Generate token pair
        const tokens = makeTokenPair(user.id, user.email, user.role);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Login successful.',
            data: {
                accessToken: tokens.accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    avatarUrl: user.avatarUrl,
                },
            },
        });
    } catch (err) {
        next(err);
    }
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { token } = req.query as { token: string };

        if (!token) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Verification token is required.' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid or expired verification token.' });
            return;
        }

        // Activate account and clear the token
        await prisma.user.update({
            where: { id: user.id },
            data: { isActive: true, emailVerificationToken: null },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });
    } catch (err) {
        next(err);
    }
}

// ─── Get Current User (Me) ────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: {
                profile: true,
                majors: { include: { major: true } },
            },
        });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found.' });
            return;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                avatarUrl: user.avatarUrl,
                profile: user.profile,
                majors: user.majors.map((um: typeof user.majors[number]) => um.major),
            },
        });
    } catch (err) {
        next(err);
    }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'No refresh token provided.' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string; email: string; role: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || !user.isActive) {
            res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'User not valid or inactive.' });
            return;
        }

        const newTokens = makeTokenPair(user.id, user.email, user.role);

        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                accessToken: newTokens.accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    avatarUrl: user.avatarUrl,
                },
            }
        });
    } catch (err) {
        // If the token is invalid or expired, clear the cookie
        res.clearCookie('refreshToken');
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.clearCookie('refreshToken');
        res.status(StatusCodes.OK).json({ success: true, message: 'Successfully logged out.' });
    } catch (err) {
        next(err);
    }
}
