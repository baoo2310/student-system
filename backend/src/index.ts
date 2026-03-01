import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import './config/env'; // Validates required env vars on startup

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';

// ─── Middleware ───────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Student System API is running 🚀' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// app.use('/api/users', userRoutes);       // coming soon
// app.use('/api/majors', majorRoutes);     // coming soon
// app.use('/api/courses', courseRoutes);   // coming soon
// app.use('/api/enrollments', enrollmentRoutes); // coming soon
// app.use('/api/match-requests', matchRequestRoutes); // coming soon

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
