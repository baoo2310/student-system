import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import './config/env'; // Validates required env vars on startup

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import majorRoutes from './routes/major.routes';
import matchRoutes from './routes/match.routes';
import instructorRoutes from './routes/instructor.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';

// ─── Middleware ───────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Student System API is running 🚀' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// app.use('/api/users', userRoutes);       // coming soon
// app.use('/api/match-requests', matchRequestRoutes); // coming soon

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
