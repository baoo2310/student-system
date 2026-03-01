import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../lib/jwt.provider';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid or expired token.' });
    }
}


// ─── Role Guard ───────────────────────────────────────────────────────────────
// Usage: router.get('/admin', authenticate, authorize('ADMIN'), handler)

export function authorize(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
            return;
        }
        next();
    };
}
