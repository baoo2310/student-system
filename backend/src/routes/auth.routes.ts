import { Router } from 'express';
import { register, login, getMe, verifyEmail } from '../controller/auth.controller';
import { validateRegister, validateLogin } from '../validation/auth.validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/verify?token=xxx  (public)
router.get('/verify', verifyEmail);

// GET /api/auth/me  (protected — must send Bearer token)
router.get('/me', authenticate, getMe);

export default router;

