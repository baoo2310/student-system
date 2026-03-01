import { Router } from 'express';
import { register, login, getMe, verifyEmail, refreshToken, logout } from '../controller/auth.controller';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRequest(registerSchema), register);

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), login);

// GET /api/auth/verify?token=xxx  (public)
router.get('/verify', verifyEmail);

// GET /api/auth/me  (protected — must send Bearer token)
router.get('/me', authenticate, getMe);

// POST /api/auth/refresh (uses httpOnly cookie)
router.post('/refresh', refreshToken);

// POST /api/auth/logout (clears cookie)
router.post('/logout', logout);

export default router;

