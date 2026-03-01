import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export function generateAccessToken(payload: JwtPayload): string {
    const secret = Buffer.from(env.JWT_ACCESS_SECRET);
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
    const secret = Buffer.from(env.JWT_ACCESS_SECRET);
    return jwt.verify(token, secret) as JwtPayload;
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export function generateRefreshToken(payload: JwtPayload): string {
    const secret = Buffer.from(env.JWT_REFRESH_SECRET);
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, secret, options);
}

export function verifyRefreshToken(token: string): JwtPayload {
    const secret = Buffer.from(env.JWT_REFRESH_SECRET);
    return jwt.verify(token, secret) as JwtPayload;
}
