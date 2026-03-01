import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';

export interface AppError extends Error {
    status?: number;
}

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';

    if (env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${status} - ${message}`);
        console.error(err.stack);
    }

    res.status(status).json({
        success: false,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
