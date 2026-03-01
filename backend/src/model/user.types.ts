// ─── Request Body Types ───────────────────────────────────────────────────────

export interface RegisterBody {
    username: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'INSTRUCTOR';
}

export interface LoginBody {
    email: string;
    password: string;
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

// ─── Express Request Extension ────────────────────────────────────────────────

// Extends Express's Request so we can attach the decoded user to req.user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
