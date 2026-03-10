import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import './config/env'; // Validates required env vars on startup

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import majorRoutes from './routes/major.routes';
import matchRoutes from './routes/match.routes';
import instructorRoutes from './routes/instructor.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import adminRoutes from './routes/admin.routes';
import settingsRoutes from './routes/settings.routes';
import reviewRoutes from './routes/review.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';

// ─── Middleware ───────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';

const app: Application = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ─── Socket.IO Config ─────────────────────────────────────────────────────────
export const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected via WebSockets:', socket.id);

    // Join a personal room to receive targeted notifications
    socket.on('join_user_room', (userId: string) => {
        socket.join(userId);
    });

    // Join conversation rooms for real-time chat
    socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

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
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// app.use('/api/users', userRoutes);       // coming soon
// app.use('/api/match-requests', matchRequestRoutes); // coming soon

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
