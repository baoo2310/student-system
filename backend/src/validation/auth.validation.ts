import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegisterBody, LoginBody } from '../model/user.types';

// ─── Register Validator ───────────────────────────────────────────────────────

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
    const { username, email, password, role } = req.body as RegisterBody;
    const errors: string[] = [];

    if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('A valid email is required.');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }
    if (role && !['STUDENT', 'INSTRUCTOR'].includes(role)) {
        errors.push('Role must be either STUDENT or INSTRUCTOR.');
    }

    if (errors.length > 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, errors });
        return;
    }

    next();
}

// ─── Login Validator ──────────────────────────────────────────────────────────

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
    const { email, password } = req.body as LoginBody;
    const errors: string[] = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('A valid email is required.');
    }
    if (!password) {
        errors.push('Password is required.');
    }

    if (errors.length > 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, errors });
        return;
    }

    next();
}
